<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$order_number = $input['order_number'] ?? '';
$phone = $input['phone'] ?? '';

if (!$order_number || !$phone) {
    sendResponse(false, 'Order number and phone number are required', null, 400);
}

// Get order details
$sql = "SELECT o.*, 
        p.name as product_name_full,
        p.icon as product_icon
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        WHERE o.order_number = :order_number AND o.customer_phone = :phone";
$stmt = $db->prepare($sql);
$stmt->bindParam(':order_number', $order_number);
$stmt->bindParam(':phone', $phone);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    sendResponse(false, 'Order not found. Please check your order number and phone number.', null, 404);
}

$order = $stmt->fetch(PDO::FETCH_ASSOC);

// Get status history
$historySql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at DESC";
$historyStmt = $db->prepare($historySql);
$historyStmt->bindParam(':order_id', $order['id']);
$historyStmt->execute();
$order['status_history'] = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

// Get customer's other orders (for history)
$otherOrdersSql = "SELECT order_number, status, total_amount, created_at 
                   FROM orders 
                   WHERE customer_phone = :phone AND order_number != :order_number 
                   ORDER BY created_at DESC LIMIT 5";
$otherStmt = $db->prepare($otherOrdersSql);
$otherStmt->bindParam(':phone', $phone);
$otherStmt->bindParam(':order_number', $order_number);
$otherStmt->execute();
$order['previous_orders'] = $otherStmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(true, 'Order details retrieved successfully', $order);
?>