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
        // Get single order with full details
        $sql = "SELECT o.*, 
                c.name as customer_full_name, c.email as customer_registered_email, c.total_orders, c.total_spent,
                p.name as product_details, p.icon
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                LEFT JOIN products p ON o.product_id = p.id
                WHERE o.id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            sendResponse(false, 'Order not found', null, 404);
        }
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get status history
        $historySql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at DESC";
        $historyStmt = $db->prepare($historySql);
        $historyStmt->bindParam(':order_id', $id);
        $historyStmt->execute();
        $order['status_history'] = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get all orders from same customer
        $customerOrdersSql = "SELECT id, order_number, total_amount, status, created_at 
                              FROM orders 
                              WHERE customer_phone = :phone 
                              ORDER BY created_at DESC";
        $customerStmt = $db->prepare($customerOrdersSql);
        $customerStmt->bindParam(':phone', $order['customer_phone']);
        $customerStmt->execute();
        $order['customer_order_history'] = $customerStmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Order retrieved successfully', $order);
        
    } else {
        // List all orders with filters
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 20;
        $offset = ($page - 1) * $limit;
        $status = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';
        
        $where = "WHERE 1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND o.status = :status";
            $params[':status'] = $status;
        }
        
        if ($search) {
            $where .= " AND (o.order_number LIKE :search OR o.customer_name LIKE :search OR o.customer_phone LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM orders o $where";
        $countStmt = $db->prepare($countSql);
        foreach ($params as $key => &$val) {
            $countStmt->bindParam($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get orders
        $sql = "SELECT o.*, c.total_orders as customer_total_orders
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                $where
                ORDER BY o.created_at DESC
                LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Orders retrieved successfully', [
            'orders' => $orders,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }
}
?>