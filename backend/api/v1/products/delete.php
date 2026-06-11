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
$checkSql = "SELECT id, name FROM products WHERE id = :id";
$checkStmt = $db->prepare($checkSql);
$checkStmt->execute([':id' => $id]);
$product = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    sendResponse(false, 'Product not found', null, 404);
}

// Soft delete - just mark as inactive
$sql = "UPDATE products SET is_active = 0 WHERE id = :id";
$stmt = $db->prepare($sql);
$result = $stmt->execute([':id' => $id]);

if ($result) {
    sendResponse(true, "Product '{$product['name']}' has been deactivated");
} else {
    sendResponse(false, "Failed to delete product", null, 500);
}

// For permanent delete (use with caution):
// $sql = "DELETE FROM products WHERE id = :id";
// $stmt = $db->prepare($sql);
// $stmt->execute([':id' => $id]);
?>