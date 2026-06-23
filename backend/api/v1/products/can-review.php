<?php
require_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$product_id = $_GET['product_id'] ?? null;
$phone = $_GET['phone'] ?? null;

if (!$product_id || !$phone) {
    sendResponse(false, 'Product ID and phone number required', null, 400);
    return;
}

try {
    // First, check if customer exists
    $customerSql = "SELECT id, name, phone FROM customers WHERE phone = :phone";
    $customerStmt = $db->prepare($customerSql);
    $customerStmt->execute([':phone' => $phone]);
    $customer = $customerStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$customer) {
        sendResponse(false, 'No account found with this phone number. Please use the phone number you used when placing your order.', null, 404);
        return;
    }
    
    // Check if customer has any orders (any status)
    $orderCheckSql = "SELECT COUNT(*) as order_count FROM orders WHERE customer_id = :customer_id";
    $orderCheckStmt = $db->prepare($orderCheckSql);
    $orderCheckStmt->execute([':customer_id' => $customer['id']]);
    $orderCount = $orderCheckStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($orderCount['order_count'] == 0) {
        sendResponse(false, 'You have not placed any orders yet. You can only review products you have purchased.', null, 404);
        return;
    }
    
    // Check if customer has purchased this specific product (any status)
    $sql = "SELECT 
                c.id as customer_id,
                o.id as order_id,
                o.order_number,
                o.product_id,
                o.product_name,
                o.status
            FROM customers c
            JOIN orders o ON o.customer_id = c.id
            WHERE c.phone = :phone 
            AND o.product_id = :product_id
            LIMIT 1";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':phone' => $phone,
        ':product_id' => $product_id
    ]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log for debugging
    error_log("Can Review Debug - Phone: $phone, Product ID: $product_id, Found: " . ($order ? 'Yes' : 'No'));
    
    if (!$order) {
        // Get the product name for a better error message
        $productSql = "SELECT display_name FROM products WHERE id = :product_id";
        $productStmt = $db->prepare($productSql);
        $productStmt->execute([':product_id' => $product_id]);
        $product = $productStmt->fetch(PDO::FETCH_ASSOC);
        $productName = $product ? $product['display_name'] : 'this product';
        
        sendResponse(false, "You haven't purchased '{$productName}' yet. You can only review products you have ordered.", null, 404);
        return;
    }
    
    // Check if already reviewed
    $checkSql = "SELECT id FROM product_reviews 
                 WHERE product_id = :product_id AND customer_id = :customer_id";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute([
        ':product_id' => $product_id,
        ':customer_id' => $order['customer_id']
    ]);
    $existing = $checkStmt->fetch();
    
    if ($existing) {
        sendResponse(false, 'You have already reviewed this product. Thank you for your feedback!', null, 409);
        return;
    }
    
    sendResponse(true, 'Customer can review', [
        'customer_id' => (int)$order['customer_id'],
        'order_id' => (int)$order['order_id'],
        'order_number' => $order['order_number'],
        'product_id' => $order['product_id'],
        'product_name' => $order['product_name']
    ]);
    
} catch (PDOException $e) {
    error_log("Can review error: " . $e->getMessage());
    sendResponse(false, 'Something went wrong. Please try again later.', null, 500);
}
?>