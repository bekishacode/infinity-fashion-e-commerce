<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'DELETE') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;

if (!$id) {
    sendResponse(false, 'Product ID is required', null, 400);
}

// Check if product exists
$checkSql = "SELECT id, name, is_active FROM products WHERE id = :id";
$checkStmt = $db->prepare($checkSql);
$checkStmt->execute([':id' => $id]);
$product = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    sendResponse(false, 'Product not found', null, 404);
}

// Only allow permanent delete if product is already soft-deleted
if ($product['is_active'] == 1) {
    sendResponse(false, 'Please move product to trash first before permanent deletion', null, 400);
}

// Check if product has any orders
$orderCheckSql = "SELECT COUNT(*) as order_count FROM orders WHERE product_id = :product_id";
$orderCheckStmt = $db->prepare($orderCheckSql);
$orderCheckStmt->execute([':product_id' => $id]);
$orderCount = $orderCheckStmt->fetch(PDO::FETCH_ASSOC)['order_count'];

if ($orderCount > 0) {
    sendResponse(false, "Cannot permanently delete this product because it has $orderCount order(s). You can only soft delete it.", null, 400);
}

// Get all images to delete physical files
$imgSql = "SELECT image_url FROM product_images WHERE product_id = :product_id";
$imgStmt = $db->prepare($imgSql);
$imgStmt->execute([':product_id' => $id]);
$images = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($images as $imgRow) {
    $file_path = __DIR__ . '/../../../..' . $imgRow['image_url'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }
}

// Permanent delete
$sql = "DELETE FROM products WHERE id = :id";
$stmt = $db->prepare($sql);
$result = $stmt->execute([':id' => $id]);

if ($result) {
    sendResponse(true, "Product '{$product['name']}' has been permanently deleted");
} else {
    sendResponse(false, "Failed to permanently delete product", null, 500);
}
?>