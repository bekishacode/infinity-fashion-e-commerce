<?php
require_once '../../../config/database.php';
require_once '../../../helpers/EmailHelper.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    try {
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
        $total_amount = $input['product_price'] * $input['quantity'];
        
        // Start transaction
        $db->beginTransaction();
        
        // =============================================
        // 1. Find or create customer
        // =============================================
        
        $checkCustomerSql = "SELECT id, total_orders, total_spent FROM customers WHERE phone = :phone";
        $checkStmt = $db->prepare($checkCustomerSql);
        $checkStmt->execute([':phone' => $customer_phone]);
        $existingCustomer = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingCustomer) {
            $customer_id = $existingCustomer['id'];
            
            $updateCustomerSql = "UPDATE customers SET 
                name = :name, 
                email = :email, 
                address = :address,
                updated_at = NOW()
                WHERE id = :id";
            $updateStmt = $db->prepare($updateCustomerSql);
            $updateStmt->execute([
                ':name' => $customer_name,
                ':email' => $customer_email,
                ':address' => $customer_address,
                ':id' => $customer_id
            ]);
            $is_new_customer = false;
        } else {
            $insertCustomerSql = "INSERT INTO customers (phone, email, name, address) 
                                  VALUES (:phone, :email, :name, :address)";
            $insertStmt = $db->prepare($insertCustomerSql);
            $insertStmt->execute([
                ':phone' => $customer_phone,
                ':email' => $customer_email,
                ':name' => $customer_name,
                ':address' => $customer_address
            ]);
            $customer_id = $db->lastInsertId();
            $is_new_customer = true;
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
        $stmt->execute([
            ':order_number' => $order_number,
            ':customer_id' => $customer_id,
            ':customer_name' => $customer_name,
            ':customer_email' => $customer_email,
            ':customer_phone' => $customer_phone,
            ':customer_address' => $customer_address,
            ':product_id' => $product_id,
            ':product_name' => $product_name,
            ':product_price' => $product_price,
            ':quantity' => $quantity,
            ':total_amount' => $total_amount,
            ':service_type' => $service_type,
            ':size' => $size,
            ':color' => $color,
            ':design_instructions' => $design_instructions,
            ':front_design_url' => $front_design_url,
            ':back_design_url' => $back_design_url,
            ':notes' => $notes
        ]);
        
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
        $updateTotalsStmt->execute([
            ':total_amount' => $total_amount,
            ':customer_id' => $customer_id
        ]);
        
        // =============================================
        // 5. Add to order status history
        // =============================================
        
        $historySql = "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) 
                       VALUES (:order_id, NULL, 'pending', 'system')";
        $historyStmt = $db->prepare($historySql);
        $historyStmt->execute([':order_id' => $order_id]);
        
        // Commit transaction
        $db->commit();
        
        // =============================================
        // 6. ADD EMAIL TO QUEUE (NON-BLOCKING)
        // =============================================
        if (!empty($customer_email)) {
            try {
                $queueSql = "INSERT INTO email_queue (order_id, recipient_email, template_key, variables) 
                            VALUES (:order_id, :email, 'order_confirmation', :variables)";
                $queueStmt = $db->prepare($queueSql);
                $queueStmt->execute([
                    ':order_id' => $order_id,
                    ':email' => $customer_email,
                    ':variables' => json_encode([
                        'customer_name' => $customer_name,
                        'order_number' => $order_number,
                        'product_name' => $product_name,
                        'quantity' => $quantity,
                        'total_amount' => $total_amount,
                        'status' => 'pending',
                        'service_type' => $service_type
                    ])
                ]);
            } catch (Exception $e) {
                // Just log, order is already created successfully
                error_log("Failed to queue email for order {$order_number}: " . $e->getMessage());
            }
        }
        
        // =============================================
        // 7. SEND RESPONSE IMMEDIATELY (NO WAITING FOR EMAIL)
        // =============================================
        sendResponse(true, "Order created successfully", [
            "order_number" => $order_number,
            "order_id" => $order_id,
            "status" => "pending",
            "customer_id" => $customer_id,
            "is_new_customer" => $is_new_customer
        ]);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        $errorMessage = $e->getMessage();
        
        if (strpos($errorMessage, 'foreign key constraint fails') !== false && strpos($errorMessage, 'product_id') !== false) {
            sendResponse(false, "Invalid product ID. The product does not exist.", null, 400);
        } else if (strpos($errorMessage, 'Duplicate entry') !== false) {
            sendResponse(false, "Duplicate entry detected.", null, 400);
        } else {
            sendResponse(false, "Database error: " . $errorMessage, null, 500);
        }
    }
    
} elseif ($method === 'GET') {
    try {
        $order_number = $_GET['order_number'] ?? '';
        $phone = $_GET['phone'] ?? '';
        
        if (!$order_number || !$phone) {
            sendResponse(false, "Order number and phone number are required", null, 400);
        }
        
        $sql = "SELECT o.*, 
                (SELECT COUNT(*) FROM orders WHERE customer_phone = :phone AND id <= o.id) as order_sequence
                FROM orders o 
                WHERE o.order_number = :order_number AND o.customer_phone = :phone";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':order_number' => $order_number,
            ':phone' => $phone
        ]);
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            sendResponse(false, "Order not found. Please check your order number and phone number.", null, 404);
        }
        
        $historySql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at DESC";
        $historyStmt = $db->prepare($historySql);
        $historyStmt->execute([':order_id' => $order['id']]);
        $order['status_history'] = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Order retrieved successfully", $order);
        
    } catch (PDOException $e) {
        sendResponse(false, "Database error: " . $e->getMessage(), null, 500);
    }
}
?>