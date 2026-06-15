<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$slug = $_GET['slug'] ?? null;
$sort = $_GET['sort'] ?? 'newest';

if (!$slug) {
    sendResponse(false, 'Sub-category slug required', null, 400);
}

try {
    // Get sub-category details
    $subSql = "SELECT sc.*, c.name as category_name, c.slug as category_slug 
               FROM sub_categories sc
               JOIN categories c ON c.id = sc.category_id
               WHERE sc.slug = :slug AND sc.is_active = 1";
    $subStmt = $db->prepare($subSql);
    $subStmt->execute([':slug' => $slug]);
    $subCategory = $subStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$subCategory) {
        sendResponse(false, 'Sub-category not found', null, 404);
    }
    
    // Get category
    $category = [
        'id' => $subCategory['category_id'],
        'name' => $subCategory['category_name'],
        'slug' => $subCategory['category_slug'],
        'display_name' => $subCategory['category_name']
    ];
    
    // Sort order
    $orderBy = match($sort) {
        'price_asc' => 'p.price ASC',
        'price_desc' => 'p.price DESC',
        'name_asc' => 'p.name ASC',
        default => 'p.created_at DESC'
    };
    
    // Get products
    $productSql = "SELECT 
                        p.id, p.name, p.slug, p.price, p.compare_price, 
                        p.service_type, p.badge, p.badge_color, p.rating, 
                        p.review_count, p.in_stock, p.min_quantity,
                        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
                    FROM products p
                    WHERE p.sub_category = :sub_category AND p.is_active = 1
                    ORDER BY $orderBy";
    $productStmt = $db->prepare($productSql);
    $productStmt->execute([':sub_category' => $subCategory['name']]);
    $products = $productStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Products retrieved', [
        'sub_category' => $subCategory,
        'category' => $category,
        'products' => $products
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>