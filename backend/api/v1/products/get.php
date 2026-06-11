<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    sendResponse(false, "Product ID is required", null, 400);
}

// Get product (1 query)
$sql = "SELECT * FROM products WHERE id = :id AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([':id' => $id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    sendResponse(false, "Product not found", null, 404);
}

// Get images for this product (1 query)
$imgSql = "SELECT image_url, image_type, is_primary, sort_order 
           FROM product_images 
           WHERE product_id = :product_id 
           ORDER BY sort_order";
$imgStmt = $db->prepare($imgSql);
$imgStmt->execute([':product_id' => $id]);
$imgRows = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

$images = [];
foreach ($imgRows as $imgRow) {
    $images[] = [
        'url' => $imgRow['image_url'],
        'type' => $imgRow['image_type'],
        'is_primary' => $imgRow['is_primary']
    ];
}
$product['images'] = $images;

// Optional: Get variants for this product (size, color, stock)
$variantSql = "SELECT size, color, color_code, price_adjustment, stock_quantity 
               FROM product_variants 
               WHERE product_id = :product_id AND is_active = 1
               ORDER BY size, color";
$variantStmt = $db->prepare($variantSql);
$variantStmt->execute([':product_id' => $id]);
$variants = $variantStmt->fetchAll(PDO::FETCH_ASSOC);
$product['variants'] = $variants;

sendResponse(true, "Product retrieved successfully", $product);
?>