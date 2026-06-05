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
$checkSql = "SELECT id, name, is_active FROM products WHERE id = $id";
$checkResult = $db->query($checkSql);

if ($checkResult->num_rows == 0) {
    sendResponse(false, 'Product not found', null, 404);
}

$product = $checkResult->fetch_assoc();

// Only allow permanent delete if product is already soft-deleted
if ($product['is_active'] == 1) {
    sendResponse(false, 'Please move product to trash first before permanent deletion', null, 400);
}

// Check if product has any orders
$orderCheckSql = "SELECT COUNT(*) as order_count FROM orders WHERE product_id = $id";
$orderCheckResult = $db->query($orderCheckSql);
$orderCount = $orderCheckResult->fetch_assoc()['order_count'];

if ($orderCount > 0) {
    sendResponse(false, "Cannot permanently delete this product because it has $orderCount order(s). You can only soft delete it.", null, 400);
}

// Get all images to delete physical files
$imgSql = "SELECT image_url FROM product_images WHERE product_id = $id";
$imgResult = $db->query($imgSql);

while ($imgRow = $imgResult->fetch_assoc()) {
    $file_path = __DIR__ . '/../../../..' . $imgRow['image_url'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }
}

// Permanent delete
$sql = "DELETE FROM products WHERE id = $id";

if ($db->query($sql)) {
    sendResponse(true, "Product '{$product['name']}' has been permanently deleted");
} else {
    sendResponse(false, "Failed to permanently delete product: " . $db->error, null, 500);
}
?>