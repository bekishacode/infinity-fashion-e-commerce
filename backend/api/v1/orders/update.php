<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$order_id = $input['order_id'] ?? 0;
$new_status = $input['status'] ?? '';

if (!$order_id || !$new_status) {
    sendResponse(false, 'Order ID and status are required', null, 400);
}

$validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
if (!in_array($new_status, $validStatuses)) {
    sendResponse(false, 'Invalid status', null, 400);
}

// Get current order status
$currentSql = "SELECT status, customer_email, order_number FROM orders WHERE id = :order_id";
$currentStmt = $db->prepare($currentSql);
$currentStmt->bindParam(':order_id', $order_id);
$currentStmt->execute();

if ($currentStmt->rowCount() === 0) {
    sendResponse(false, 'Order not found', null, 404);
}

$current = $currentStmt->fetch(PDO::FETCH_ASSOC);
$old_status = $current['status'];

// Prevent updating to same status
if ($old_status === $new_status) {
    sendResponse(false, 'Order is already in this status', null, 400);
}

// Prevent updating cancelled or delivered orders
if (in_array($old_status, ['delivered', 'cancelled'])) {
    sendResponse(false, "Cannot update order that is {$old_status}", null, 400);
}

// Update order status
$query = "UPDATE orders SET status = :status, updated_at = NOW() WHERE id = :order_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':status', $new_status);
$stmt->bindParam(':order_id', $order_id);

if ($stmt->execute()) {
    // Add to status history
    $historySql = "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) 
                   VALUES (:order_id, :old_status, :new_status, 'admin')";
    $historyStmt = $db->prepare($historySql);
    $historyStmt->bindParam(':order_id', $order_id);
    $historyStmt->bindParam(':old_status', $old_status);
    $historyStmt->bindParam(':new_status', $new_status);
    $historyStmt->execute();
    
    // Track which status emails have been sent
    $statusEmailSent = $current['status_email_sent'] ?? '';
    if ($statusEmailSent) {
        $sentArray = explode(',', $statusEmailSent);
        if (!in_array($new_status, $sentArray)) {
            // Status email not sent yet for this status
            // You'll implement email sending later via separate endpoint
        }
    }
    
    sendResponse(true, 'Order status updated successfully', [
        'old_status' => $old_status,
        'new_status' => $new_status,
        'order_number' => $current['order_number']
    ]);
} else {
    sendResponse(false, 'Failed to update order status: ' . $stmt->errorInfo()[2], null, 500);
}
?>