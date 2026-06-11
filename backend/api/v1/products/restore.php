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
$checkSql = "SELECT id, name, is_active FROM products WHERE id = :id";
$checkStmt = $db->prepare($checkSql);
$checkStmt->execute([':id' => $id]);
$product = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    sendResponse(false, 'Product not found', null, 404);
}

if ($product['is_active'] == 1) {
    sendResponse(false, 'Product is already active', null, 400);
}

// Restore product (set is_active = 1)
$sql = "UPDATE products SET is_active = 1 WHERE id = :id";
$stmt = $db->prepare($sql);
$result = $stmt->execute([':id' => $id]);

if ($result) {
    sendResponse(true, "Product '{$product['name']}' has been restored");
} else {
    sendResponse(false, "Failed to restore product", null, 500);
}
?>