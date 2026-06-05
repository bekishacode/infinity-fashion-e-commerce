<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    sendResponse(false, "Product ID is required", null, 400);
}

// Get product (1 query)
$sql = "SELECT * FROM products WHERE id = ? AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    sendResponse(false, "Product not found", null, 404);
}

$product = $result->fetch_assoc();

// Get images for this product (1 query)
$imgSql = "SELECT image_url, image_type, is_primary, sort_order 
           FROM product_images 
           WHERE product_id = ? 
           ORDER BY sort_order";
$imgStmt = $db->prepare($imgSql);
$imgStmt->bind_param("i", $id);
$imgStmt->execute();
$imgResult = $imgStmt->get_result();

$images = [];
while ($imgRow = $imgResult->fetch_assoc()) {
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
               WHERE product_id = ? AND is_active = 1
               ORDER BY size, color";
$variantStmt = $db->prepare($variantSql);
$variantStmt->bind_param("i", $id);
$variantStmt->execute();
$variantResult = $variantStmt->get_result();

$variants = [];
while ($variantRow = $variantResult->fetch_assoc()) {
    $variants[] = $variantRow;
}
$product['variants'] = $variants;

sendResponse(true, "Product retrieved successfully", $product);
?>