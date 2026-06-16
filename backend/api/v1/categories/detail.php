<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$slug = $_GET['slug'] ?? null;

if (!$slug) {
    sendResponse(false, 'Category slug required', null, 400);
}

try {
    // Get category by slug only - the slug already contains service type info
    $categorySql = "SELECT * FROM categories WHERE slug = :slug AND is_active = 1";
    $categoryStmt = $db->prepare($categorySql);
    $categoryStmt->execute([':slug' => $slug]);
    $category = $categoryStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        sendResponse(false, 'Category not found', null, 404);
        return;
    }
    
    // Get sub-categories with product counts
    $subSql = "SELECT 
                    sc.*,
                    COUNT(DISTINCT p.id) as product_count
                FROM sub_categories sc
                LEFT JOIN products p ON p.sub_category = sc.name AND p.is_active = 1
                WHERE sc.category_id = :category_id AND sc.is_active = 1
                GROUP BY sc.id
                ORDER BY sc.sort_order ASC";
    
    $subStmt = $db->prepare($subSql);
    $subStmt->execute([':category_id' => $category['id']]);
    $subCategories = $subStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Category details retrieved', [
        'category' => $category,
        'sub_categories' => $subCategories
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>