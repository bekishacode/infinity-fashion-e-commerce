<?php
// backend/api/v1/products/by-category.php
require_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$category_id = $_GET['category_id'] ?? null;

if (!$category_id) {
    sendResponse(false, 'Category ID required', null, 400);
    return;
}

try {
    // Get the category name from the ID
    $catStmt = $db->prepare("SELECT name, display_name FROM categories WHERE id = :id AND is_active = 1");
    $catStmt->execute([':id' => $category_id]);
    $category = $catStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        sendResponse(false, 'Category not found', null, 404);
        return;
    }
    
    // Get products with their primary image - NO GROUP BY
    $sql = "SELECT 
                p.id,
                p.name,
                p.price,
                p.rating,
                p.slug,
                pi.image_url as primary_image
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.category = :category_name 
            AND p.is_active = 1
            ORDER BY p.name ASC
            LIMIT 100";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':category_name' => $category['name']]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Products retrieved', $products);
    
} catch (PDOException $e) {
    error_log("Products by category error: " . $e->getMessage());
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>