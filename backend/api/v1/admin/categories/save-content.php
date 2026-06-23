<?php
// backend/api/v1/admin/categories/save-content.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['category_id'])) {
    sendResponse(false, 'Category ID required', null, 400);
    return;
}

$category_id = (int)$data['category_id'];

try {
    $pageContent = [
        'how_to_order' => $data['how_to_order'] ?? [],
        'faqs' => $data['faqs'] ?? [],
        'popular_products' => $data['popular_products'] ?? [],
        'stats' => $data['stats'] ?? [
            'delivery_time' => '',
            'quality_guarantee' => '',
            'customer_rating' => ''
        ],
        'trust_badge' => $data['trust_badge'] ?? [
            'title' => '',
            'rating' => ''
        ]
    ];
    
    $jsonContent = json_encode($pageContent, JSON_UNESCAPED_UNICODE);
    
    $sql = "UPDATE categories SET page_content = :content WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':content', $jsonContent, PDO::PARAM_STR);
    $stmt->bindParam(':id', $category_id, PDO::PARAM_INT);
    $stmt->execute();
    
    sendResponse(true, 'Category content saved successfully', [
        'category_id' => $category_id,
        'content' => $pageContent
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>