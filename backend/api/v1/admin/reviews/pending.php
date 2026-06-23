<?php
// backend/api/v1/admin/reviews/pending.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$page = (int)($_GET['page'] ?? 1);
$limit = (int)($_GET['limit'] ?? 20);
$offset = ($page - 1) * $limit;

try {
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM product_reviews WHERE is_approved = 0";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get pending reviews with customer and product info
    $sql = "SELECT 
                r.id,
                r.rating,
                r.title,
                r.review,
                r.created_at,
                c.name as customer_name,
                c.phone as customer_phone,
                p.name as product_name,
                p.id as product_id,
                p.slug as product_slug
            FROM product_reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN products p ON p.id = r.product_id
            WHERE r.is_approved = 0
            ORDER BY r.created_at ASC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Pending reviews retrieved', [
        'reviews' => $reviews,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => (int)$total['total'],
            'total_pages' => ceil($total['total'] / $limit)
        ]
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>