<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$slug = $_GET['slug'] ?? null;

if (!$slug) {
    sendResponse(false, 'Product slug required', null, 400);
}

try {
    // Get product details
    $productSql = "SELECT 
                        p.*,
                        c.slug as category_slug,
                        sc.slug as sub_category_slug
                    FROM products p
                    LEFT JOIN categories c ON c.name = p.category
                    LEFT JOIN sub_categories sc ON sc.name = p.sub_category
                    WHERE p.slug = :slug AND p.is_active = 1";
    $productStmt = $db->prepare($productSql);
    $productStmt->execute([':slug' => $slug]);
    $product = $productStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        sendResponse(false, 'Product not found', null, 404);
    }
    
    // Get variants
    $variantSql = "SELECT * FROM product_variants WHERE product_id = :product_id AND is_active = 1";
    $variantStmt = $db->prepare($variantSql);
    $variantStmt->execute([':product_id' => $product['id']]);
    $product['variants'] = $variantStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get images
    $imageSql = "SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order ASC";
    $imageStmt = $db->prepare($imageSql);
    $imageStmt->execute([':product_id' => $product['id']]);
    $product['images'] = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get related products (same sub-category)
    $relatedSql = "SELECT 
                        id, name, slug, price, rating,
                        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
                    FROM products p
                    WHERE sub_category = :sub_category AND id != :product_id AND is_active = 1
                    LIMIT 4";
    $relatedStmt = $db->prepare($relatedSql);
    $relatedStmt->execute([
        ':sub_category' => $product['sub_category'],
        ':product_id' => $product['id']
    ]);
    $product['related_products'] = $relatedStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Product retrieved', $product);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>