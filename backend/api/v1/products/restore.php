<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;

if (!$id) {
    sendResponse(false, 'Product ID is required', null, 400);
}

// Check if product exists and is deleted
$checkSql = "SELECT id, name, is_active FROM products WHERE id = $id";
$checkResult = $db->query($checkSql);

if ($checkResult->num_rows == 0) {
    sendResponse(false, 'Product not found', null, 404);
}

$product = $checkResult->fetch_assoc();

if ($product['is_active'] == 1) {
    sendResponse(false, 'Product is already active', null, 400);
}

// Restore product (set is_active = 1)
$sql = "UPDATE products SET is_active = 1 WHERE id = $id";

if ($db->query($sql)) {
    sendResponse(true, "Product '{$product['name']}' has been restored");
} else {
    sendResponse(false, "Failed to restore product: " . $db->error, null, 500);
}
?>