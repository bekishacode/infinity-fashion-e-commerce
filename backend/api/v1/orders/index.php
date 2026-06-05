<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['customer_name', 'customer_phone', 'customer_address', 'product_id', 'product_name', 'product_price', 'quantity', 'service_type'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            sendResponse(false, "Field '{$field}' is required", null, 400);
        }
    }
    
    $customer_name = $input['customer_name'];
    $customer_phone = $input['customer_phone'];
    $customer_email = $input['customer_email'] ?? null;
    $customer_address = $input['customer_address'];
    
    // =============================================
    // 1. Find or create customer
    // =============================================
    
    // Check if customer exists by phone
    $checkCustomerSql = "SELECT id, total_orders, total_spent FROM customers WHERE phone = :phone";
    $checkStmt = $db->prepare($checkCustomerSql);
    $checkStmt->bindParam(':phone', $customer_phone);
    $checkStmt->execute();
    
    $total_amount = $input['product_price'] * $input['quantity'];
    
    if ($checkStmt->rowCount() > 0) {
        // Existing customer - update info if changed
        $customer = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $customer_id = $customer['id'];
        
        // Update customer info (name, email, address might have changed)
        $updateCustomerSql = "UPDATE customers SET 
            name = :name, 
            email = :email, 
            address = :address,
            updated_at = NOW()
            WHERE id = :id";
        $updateStmt = $db->prepare($updateCustomerSql);
        $updateStmt->bindParam(':name', $customer_name);
        $updateStmt->bindParam(':email', $customer_email);
        $updateStmt->bindParam(':address', $customer_address);
        $updateStmt->bindParam(':id', $customer_id);
        $updateStmt->execute();
        
        // Update totals later after order is created
    } else {
        // Create new customer
        $insertCustomerSql = "INSERT INTO customers (phone, email, name, address) 
                              VALUES (:phone, :email, :name, :address)";
        $insertStmt = $db->prepare($insertCustomerSql);
        $insertStmt->bindParam(':phone', $customer_phone);
        $insertStmt->bindParam(':email', $customer_email);
        $insertStmt->bindParam(':name', $customer_name);
        $insertStmt->bindParam(':address', $customer_address);
        $insertStmt->execute();
        $customer_id = $db->lastInsertId();
    }
    
    // =============================================
    // 2. Generate Order Number
    // =============================================
    
    $date = date('Ymd');
    $countSql = "SELECT COUNT(*) + 1 as next FROM orders WHERE DATE(created_at) = CURDATE()";
    $countResult = $db->query($countSql);
    $countRow = $countResult->fetch(PDO::FETCH_ASSOC);
    $sequential = str_pad($countRow['next'], 4, '0', STR_PAD_LEFT);
    $order_number = "ORD-{$date}-{$sequential}";
    
    // =============================================
    // 3. Create Order
    // =============================================
    
    $product_id = $input['product_id'];
    $product_name = $input['product_name'];
    $product_price = $input['product_price'];
    $quantity = $input['quantity'];
    $service_type = $input['service_type'];
    $size = $input['size'] ?? null;
    $color = $input['color'] ?? null;
    $design_instructions = $input['design_instructions'] ?? null;
    $front_design_url = $input['front_design_url'] ?? null;
    $back_design_url = $input['back_design_url'] ?? null;
    $notes = $input['notes'] ?? null;
    
    $sql = "INSERT INTO orders (
        order_number, customer_id, customer_name, customer_email, customer_phone, customer_address,
        product_id, product_name, product_price, quantity, total_amount, service_type, 
        size, color, design_instructions, front_design_url, back_design_url, notes, status
    ) VALUES (
        :order_number, :customer_id, :customer_name, :customer_email, :customer_phone, :customer_address,
        :product_id, :product_name, :product_price, :quantity, :total_amount, :service_type,
        :size, :color, :design_instructions, :front_design_url, :back_design_url, :notes, 'pending'
    )";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':order_number', $order_number);
    $stmt->bindParam(':customer_id', $customer_id);
    $stmt->bindParam(':customer_name', $customer_name);
    $stmt->bindParam(':customer_email', $customer_email);
    $stmt->bindParam(':customer_phone', $customer_phone);
    $stmt->bindParam(':customer_address', $customer_address);
    $stmt->bindParam(':product_id', $product_id);
    $stmt->bindParam(':product_name', $product_name);
    $stmt->bindParam(':product_price', $product_price);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':total_amount', $total_amount);
    $stmt->bindParam(':service_type', $service_type);
    $stmt->bindParam(':size', $size);
    $stmt->bindParam(':color', $color);
    $stmt->bindParam(':design_instructions', $design_instructions);
    $stmt->bindParam(':front_design_url', $front_design_url);
    $stmt->bindParam(':back_design_url', $back_design_url);
    $stmt->bindParam(':notes', $notes);
    
    if ($stmt->execute()) {
        $order_id = $db->lastInsertId();
        
        // =============================================
        // 4. Update customer totals
        // =============================================
        
        $updateTotalsSql = "UPDATE customers SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + :total_amount,
            last_order_at = NOW()
            WHERE id = :customer_id";
        $updateTotalsStmt = $db->prepare($updateTotalsSql);
        $updateTotalsStmt->bindParam(':total_amount', $total_amount);
        $updateTotalsStmt->bindParam(':customer_id', $customer_id);
        $updateTotalsStmt->execute();
        
        // =============================================
        // 5. Add to order status history
        // =============================================
        
        $historySql = "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) 
                       VALUES (:order_id, NULL, 'pending', 'system')";
        $historyStmt = $db->prepare($historySql);
        $historyStmt->bindParam(':order_id', $order_id);
        $historyStmt->execute();
        
        // =============================================
        // 6. Send confirmation email (if email provided)
        // =============================================
        
        $email_sent = false;
        if (!empty($customer_email)) {
            // You'll implement email sending later
            // For now, just mark as not sent
            $email_sent = false;
        }
        
        // Update order with email sent status
        $emailUpdateSql = "UPDATE orders SET confirmation_email_sent = :sent WHERE id = :order_id";
        $emailUpdateStmt = $db->prepare($emailUpdateSql);
        $emailUpdateStmt->bindParam(':sent', $email_sent, PDO::PARAM_BOOL);
        $emailUpdateStmt->bindParam(':order_id', $order_id);
        $emailUpdateStmt->execute();
        
        sendResponse(true, "Order created successfully", [
            "order_number" => $order_number,
            "order_id" => $order_id,
            "status" => "pending",
            "customer_id" => $customer_id,
            "is_new_customer" => ($checkStmt->rowCount() == 0)
        ]);
    } else {
        sendResponse(false, "Failed to create order: " . $stmt->errorInfo()[2], null, 500);
    }
    
} elseif ($method === 'GET') {
    // Track order by order_number and phone
    $order_number = $_GET['order_number'] ?? '';
    $phone = $_GET['phone'] ?? '';
    
    if (!$order_number || !$phone) {
        sendResponse(false, "Order number and phone number are required", null, 400);
    }
    
    $sql = "SELECT o.*, 
            (SELECT COUNT(*) FROM orders WHERE customer_phone = o.customer_phone AND id <= o.id) as order_sequence
            FROM orders o 
            WHERE o.order_number = :order_number AND o.customer_phone = :phone";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':order_number', $order_number);
    $stmt->bindParam(':phone', $phone);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendResponse(false, "Order not found. Please check your order number and phone number.", null, 404);
    }
    
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get status history for this order
    $historySql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at DESC";
    $historyStmt = $db->prepare($historySql);
    $historyStmt->bindParam(':order_id', $order['id']);
    $historyStmt->execute();
    $order['status_history'] = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, "Order retrieved successfully", $order);
}
?>