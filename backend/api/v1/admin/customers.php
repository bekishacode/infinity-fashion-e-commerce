<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $id = $_GET['id'] ?? 0;
    
    if ($id) {
        // Get single customer with full details
        $sql = "SELECT c.*, 
                (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as total_orders_count,
                (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.id) as total_spent_amount
                FROM customers c
                WHERE c.id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(false, 'Customer not found', null, 404);
        }
        
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get customer's order history
        $ordersSql = "SELECT id, order_number, total_amount, status, created_at 
                      FROM orders 
                      WHERE customer_id = :customer_id 
                      ORDER BY created_at DESC
                      LIMIT 50";
        $ordersStmt = $db->prepare($ordersSql);
        $ordersStmt->execute([':customer_id' => $id]);
        $customer['orders'] = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Customer retrieved successfully', $customer);
        
    } else {
        // List all customers with filters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
        $sort_order = isset($_GET['sort_order']) ? $_GET['sort_order'] : 'DESC';
        
        // Build WHERE clause
        $where = "WHERE 1=1";
        $params = [];
        
        if ($search) {
            $where .= " AND (name LIKE :search OR phone LIKE :search OR email LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        // Allowed sort columns
        $allowedSort = ['created_at', 'total_orders', 'total_spent', 'name', 'last_order_at'];
        if (!in_array($sort_by, $allowedSort)) {
            $sort_by = 'created_at';
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM customers $where";
        $countStmt = $db->prepare($countSql);
        foreach ($params as $key => &$val) {
            $countStmt->bindParam($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get customers
        $sql = "SELECT c.* 
                FROM customers c
                $where
                ORDER BY $sort_by $sort_order
                LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        $stmt->execute();
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Customers retrieved successfully', [
            'customers' => $customers,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }
    
} elseif ($method === 'PUT') {
    // UPDATE CUSTOMER - Only super admin can update
    // Verify super admin role
    if ($admin['role'] !== 'super_admin') {
        sendResponse(false, 'Only super admin can update customer information', null, 403);
    }
    
    $id = $_GET['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Customer ID required', null, 400);
    }
    
    // Check if customer exists
    $checkSql = "SELECT id FROM customers WHERE id = :id";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute([':id' => $id]);
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Customer not found', null, 404);
    }
    
    $updates = [];
    $params = [];
    
    if (isset($input['name'])) {
        $updates[] = "name = :name";
        $params[':name'] = $input['name'];
    }
    if (isset($input['phone'])) {
        // Check if phone already exists for another customer
        $phoneCheckSql = "SELECT id FROM customers WHERE phone = :phone AND id != :id";
        $phoneCheckStmt = $db->prepare($phoneCheckSql);
        $phoneCheckStmt->execute([':phone' => $input['phone'], ':id' => $id]);
        if ($phoneCheckStmt->rowCount() > 0) {
            sendResponse(false, 'Phone number already exists for another customer', null, 400);
        }
        $updates[] = "phone = :phone";
        $params[':phone'] = $input['phone'];
    }
    if (isset($input['email'])) {
        // Check if email already exists for another customer
        if (!empty($input['email'])) {
            $emailCheckSql = "SELECT id FROM customers WHERE email = :email AND id != :id";
            $emailCheckStmt = $db->prepare($emailCheckSql);
            $emailCheckStmt->execute([':email' => $input['email'], ':id' => $id]);
            if ($emailCheckStmt->rowCount() > 0) {
                sendResponse(false, 'Email already exists for another customer', null, 400);
            }
        }
        $updates[] = "email = :email";
        $params[':email'] = $input['email'];
    }
    if (isset($input['address'])) {
        $updates[] = "address = :address";
        $params[':address'] = $input['address'];
    }
    
    if (empty($updates)) {
        sendResponse(false, 'No fields to update', null, 400);
    }
    
    $params[':id'] = $id;
    $sql = "UPDATE customers SET " . implode(", ", $updates) . ", updated_at = NOW() WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($params)) {
        sendResponse(true, 'Customer updated successfully');
    } else {
        sendResponse(false, 'Failed to update customer', null, 500);
    }
}
?>