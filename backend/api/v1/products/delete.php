<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'DELETE') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? $_GET['id'] ?? 0;

if (!$id) {
    sendResponse(false, 'Product ID is required', null, 400);
}

// Check if product exists
$checkSql = "SELECT id, name FROM products WHERE id = $id";
$checkResult = $db->query($checkSql);

if ($checkResult->num_rows == 0) {
    sendResponse(false, 'Product not found', null, 404);
}

$product = $checkResult->fetch_assoc();

// Soft delete - just mark as inactive
$sql = "UPDATE products SET is_active = 0 WHERE id = $id";

if ($db->query($sql)) {
    sendResponse(true, "Product '{$product['name']}' has been deactivated");
} else {
    sendResponse(false, "Failed to delete product: " . $db->error, null, 500);
}

// For permanent delete (use with caution):
// $sql = "DELETE FROM products WHERE id = $id";
?>