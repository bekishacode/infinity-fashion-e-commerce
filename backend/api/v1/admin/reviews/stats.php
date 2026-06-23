<?php
// backend/api/v1/admin/reviews/stats.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $sql = "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) as pending
            FROM product_reviews";
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Review stats retrieved', [
        'total' => (int)$stats['total'],
        'approved' => (int)$stats['approved'],
        'pending' => (int)$stats['pending']
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>