<?php
require_once '../../../config/database.php';
require_once '../../../helpers/EmailHelper.php';

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

// Fetch more order details including service_type, product_name, quantity, total_amount
$currentSql = "SELECT status, customer_email, order_number, customer_name, 
                       service_type, product_name, quantity, total_amount 
                FROM orders 
                WHERE id = :order_id";
$currentStmt = $db->prepare($currentSql);
$currentStmt->bindParam(':order_id', $order_id);
$currentStmt->execute();

if ($currentStmt->rowCount() === 0) {
    sendResponse(false, 'Order not found', null, 404);
}

$current = $currentStmt->fetch(PDO::FETCH_ASSOC);
$old_status = $current['status'];

if ($old_status === $new_status) {
    sendResponse(false, 'Order is already in this status', null, 400);
}

if (in_array($old_status, ['delivered', 'cancelled'])) {
    sendResponse(false, "Cannot update order that is {$old_status}", null, 400);
}

$query = "UPDATE orders SET status = :status, updated_at = NOW() WHERE id = :order_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':status', $new_status);
$stmt->bindParam(':order_id', $order_id);

if ($stmt->execute()) {
    $historySql = "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) 
                   VALUES (:order_id, :old_status, :new_status, 'admin')";
    $historyStmt = $db->prepare($historySql);
    $historyStmt->bindParam(':order_id', $order_id);
    $historyStmt->bindParam(':old_status', $old_status);
    $historyStmt->bindParam(':new_status', $new_status);
    $historyStmt->execute();
    
    // =============================================
    // ADD STATUS UPDATE EMAIL TO QUEUE (NON-BLOCKING)
    // =============================================
    if (!empty($current['customer_email'])) {
        try {
            $queueSql = "INSERT INTO email_queue (order_id, recipient_email, template_key, variables) 
                        VALUES (:order_id, :email, 'order_status_update', :variables)";
            $queueStmt = $db->prepare($queueSql);
            $queueStmt->execute([
                ':order_id' => $order_id,
                ':email' => $current['customer_email'],
                ':variables' => json_encode([
                    'customer_name' => $current['customer_name'],
                    'order_number' => $current['order_number'],
                    'old_status' => $old_status,
                    'new_status' => $new_status,
                    'service_type' => $current['service_type'],
                    'product_name' => $current['product_name'],
                    'quantity' => $current['quantity'],
                    'total_amount' => $current['total_amount']
                ])
            ]);
        } catch (Exception $e) {
            error_log("Failed to queue status update email: " . $e->getMessage());
        }
    }
    
    sendResponse(true, 'Order status updated successfully', [
        'old_status' => $old_status,
        'new_status' => $new_status,
        'order_number' => $current['order_number']
    ]);
    
} else {
    sendResponse(false, 'Failed to update order status', null, 500);
}
?>