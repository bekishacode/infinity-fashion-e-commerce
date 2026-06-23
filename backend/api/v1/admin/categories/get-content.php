<?php
// backend/api/v1/admin/categories/get-content.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$category_id = $_GET['category_id'] ?? null;

if (!$category_id) {
    sendResponse(false, 'Category ID required', null, 400);
}

try {
    $sql = "SELECT id, name, display_name, slug, page_content 
            FROM categories 
            WHERE id = :id AND is_active = 1";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $category_id]);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        sendResponse(false, 'Category not found', null, 404);
        return;
    }
    
    // Parse page_content (now TEXT, not JSON type)
    $pageContent = [];
    if (!empty($category['page_content'])) {
        $decoded = json_decode($category['page_content'], true);
        if (is_array($decoded)) {
            $pageContent = $decoded;
        }
    }
    
    $response = [
        'category' => [
            'id' => (int)$category['id'],
            'name' => $category['name'],
            'display_name' => $category['display_name'],
            'slug' => $category['slug']
        ],
        'content' => [
            'how_to_order' => $pageContent['how_to_order'] ?? [],
            'faqs' => $pageContent['faqs'] ?? [],
            'popular_products' => $pageContent['popular_products'] ?? [],
            'stats' => $pageContent['stats'] ?? [
                'delivery_time' => '',
                'quality_guarantee' => '',
                'customer_rating' => ''
            ],
            'trust_badge' => $pageContent['trust_badge'] ?? [
                'title' => '',
                'rating' => ''
            ]
        ]
    ];
    
    sendResponse(true, 'Category content retrieved', $response);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>