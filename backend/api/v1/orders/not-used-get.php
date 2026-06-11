<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$order_number = $_GET['order_number'] ?? '';

if (!$order_number) {
    sendResponse(false, 'Order number is required', null, 400);
}

$query = "SELECT * FROM orders WHERE order_number = :order_number";
$stmt = $db->prepare($query);
$stmt->bindParam(':order_number', $order_number);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    sendResponse(false, 'Order not found', null, 404);
}

$order = $stmt->fetch(PDO::FETCH_ASSOC);
sendResponse(true, 'Order retrieved successfully', $order);
?>