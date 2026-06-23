<?php
require_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents('php://input'), true);

$required = ['product_id', 'customer_id', 'phone', 'rating', 'review'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        sendResponse(false, ucfirst($field) . ' is required', null, 400);
        return;
    }
}

$product_id = (int)$data['product_id'];
$customer_id = (int)$data['customer_id'];
$phone = $data['phone'];
$rating = (int)$data['rating'];
$title = $data['title'] ?? null;
$review = trim($data['review']);

if ($rating < 1 || $rating > 5) {
    sendResponse(false, 'Rating must be between 1 and 5', null, 400);
    return;
}

if (strlen($review) < 10) {
    sendResponse(false, 'Review must be at least 10 characters', null, 400);
    return;
}

try {
    // Check if customer exists and has purchased this product (any status)
    $verifySql = "SELECT 
                    c.id as customer_id,
                    o.id as order_id,
                    o.order_number
                  FROM customers c
                  JOIN orders o ON o.customer_id = c.id
                  WHERE c.phone = :phone 
                  AND c.id = :customer_id
                  AND o.product_id = :product_id
                  LIMIT 1";
    
    $verifyStmt = $db->prepare($verifySql);
    $verifyStmt->execute([
        ':phone' => $phone,
        ':customer_id' => $customer_id,
        ':product_id' => $product_id
    ]);
    $order = $verifyStmt->fetch();
    
    if (!$order) {
        sendResponse(false, 'No purchase found for this product. You can only review products you have ordered.', null, 403);
        return;
    }
    
    // Check if already reviewed
    $checkSql = "SELECT id FROM product_reviews 
                 WHERE product_id = :product_id AND customer_id = :customer_id";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute([
        ':product_id' => $product_id,
        ':customer_id' => $customer_id
    ]);
    $existing = $checkStmt->fetch();
    
    if ($existing) {
        sendResponse(false, 'You have already reviewed this product', null, 409);
        return;
    }
    
    // Insert review (pending approval)
    $insertSql = "INSERT INTO product_reviews (
                    product_id, customer_id, order_id, rating, title, 
                    review, verified_purchase, is_approved
                  ) VALUES (
                    :product_id, :customer_id, :order_id, :rating, :title,
                    :review, 1, 0
                  )";
    
    $insertStmt = $db->prepare($insertSql);
    $result = $insertStmt->execute([
        ':product_id' => $product_id,
        ':customer_id' => $customer_id,
        ':order_id' => $order['order_id'],
        ':rating' => $rating,
        ':title' => $title,
        ':review' => $review
    ]);
    
    if ($result) {
        $reviewId = $db->lastInsertId();
        
        sendResponse(true, 'Review submitted successfully and pending approval', [
            'review_id' => $reviewId,
            'verified_purchase' => true,
            'pending_approval' => true
        ]);
    } else {
        sendResponse(false, 'Failed to submit review', null, 500);
    }
    
} catch (PDOException $e) {
    error_log("Submit review error: " . $e->getMessage());
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>