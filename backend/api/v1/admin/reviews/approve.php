<?php
// backend/api/v1/admin/reviews/approve.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['review_id']) || !isset($data['action'])) {
    sendResponse(false, 'Review ID and action required', null, 400);
    return;
}

$review_id = (int)$data['review_id'];
$action = $data['action']; // 'approve' or 'reject'

if (!in_array($action, ['approve', 'reject'])) {
    sendResponse(false, 'Invalid action', null, 400);
    return;
}

try {
    $db->beginTransaction();
    
    if ($action === 'approve') {
        // Approve review
        $sql = "UPDATE product_reviews SET is_approved = 1 WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $review_id]);
        
        // Get product_id for rating update
        $productSql = "SELECT product_id FROM product_reviews WHERE id = :id";
        $productStmt = $db->prepare($productSql);
        $productStmt->execute([':id' => $review_id]);
        $product = $productStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            // Update product rating
            $updateSql = "UPDATE products p 
                          SET 
                              p.rating = (
                                  SELECT COALESCE(AVG(rating), 0) 
                                  FROM product_reviews 
                                  WHERE product_id = p.id AND is_approved = 1
                              ),
                              p.review_count = (
                                  SELECT COUNT(*) 
                                  FROM product_reviews 
                                  WHERE product_id = p.id AND is_approved = 1
                              )
                          WHERE p.id = :product_id";
            $updateStmt = $db->prepare($updateSql);
            $updateStmt->execute([':product_id' => $product['product_id']]);
        }
        
        $message = 'Review approved successfully';
    } else {
        // Reject review (delete it)
        $sql = "DELETE FROM product_reviews WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $review_id]);
        $message = 'Review rejected and removed';
    }
    
    $db->commit();
    sendResponse(true, $message);
    
} catch (PDOException $e) {
    $db->rollBack();
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>