<?php
require_once __DIR__ . '/../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$product_id = $_GET['product_id'] ?? null;
$page = (int)($_GET['page'] ?? 1);
$limit = (int)($_GET['limit'] ?? 10);
$rating_filter = $_GET['rating'] ?? null;
$sort = $_GET['sort'] ?? 'highest';

if (!$product_id) {
    sendResponse(false, 'Product ID required', null, 400);
    return;
}

$offset = ($page - 1) * $limit;

try {
    // Get review stats (only approved reviews)
    $statsSql = "SELECT 
                    COUNT(*) as total_reviews,
                    COALESCE(AVG(rating), 0) as average_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
                    SUM(CASE WHEN verified_purchase = 1 THEN 1 ELSE 0 END) as verified_count
                FROM product_reviews
                WHERE product_id = :product_id AND is_approved = 1";
    
    $statsStmt = $db->prepare($statsSql);
    $statsStmt->execute([':product_id' => $product_id]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // Build sort clause
    $sortClause = match($sort) {
        'lowest' => 'ORDER BY r.rating ASC, r.created_at DESC',
        'oldest' => 'ORDER BY r.created_at ASC',
        'newest' => 'ORDER BY r.created_at DESC',
        default => 'ORDER BY r.rating DESC, r.created_at DESC' // highest
    };
    
    // Build rating filter
    $ratingCondition = '';
    $params = [':product_id' => $product_id];
    if ($rating_filter && in_array($rating_filter, [1,2,3,4,5])) {
        $ratingCondition = 'AND r.rating = :rating';
        $params[':rating'] = (int)$rating_filter;
    }
    
    // Get reviews (only approved)
    $sql = "SELECT 
                r.id,
                r.product_id,
                r.customer_id,
                r.rating,
                r.title,
                r.review,
                r.verified_purchase,
                r.created_at,
                r.updated_at,
                c.name as customer_name,
                c.phone as customer_phone
            FROM product_reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            WHERE r.product_id = :product_id 
            AND r.is_approved = 1
            $ratingCondition
            $sortClause
            LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':product_id', $params[':product_id'], PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    if (isset($params[':rating'])) {
        $stmt->bindParam(':rating', $params[':rating'], PDO::PARAM_INT);
    }
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Build rating distribution
    $distribution = [
        5 => (int)($stats['rating_5'] ?? 0),
        4 => (int)($stats['rating_4'] ?? 0),
        3 => (int)($stats['rating_3'] ?? 0),
        2 => (int)($stats['rating_2'] ?? 0),
        1 => (int)($stats['rating_1'] ?? 0),
    ];
    
    $response = [
        'stats' => [
            'average_rating' => round($stats['average_rating'] ?? 0, 1),
            'total_reviews' => (int)($stats['total_reviews'] ?? 0),
            'verified_count' => (int)($stats['verified_count'] ?? 0),
            'distribution' => $distribution,
            'percentage_verified' => $stats['total_reviews'] > 0 
                ? round(($stats['verified_count'] / $stats['total_reviews']) * 100, 1) 
                : 0
        ],
        'reviews' => $reviews,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => (int)($stats['total_reviews'] ?? 0),
            'total_pages' => ceil(($stats['total_reviews'] ?? 0) / $limit)
        ]
    ];
    
    sendResponse(true, 'Reviews retrieved', $response);
    
} catch (PDOException $e) {
    error_log("Reviews error: " . $e->getMessage());
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>