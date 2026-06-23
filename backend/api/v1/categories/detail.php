<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$slug = $_GET['slug'] ?? null;

if (!$slug) {
    sendResponse(false, 'Category slug required', null, 400);
}

try {
    // Get category with page_content
    $categorySql = "SELECT 
                        c.*,
                        -- Parse JSON fields for easier frontend consumption
                        JSON_EXTRACT(c.page_content, '$.how_to_order') as how_to_order,
                        JSON_EXTRACT(c.page_content, '$.faqs') as faqs,
                        JSON_EXTRACT(c.page_content, '$.popular_products') as popular_products,
                        JSON_EXTRACT(c.page_content, '$.stats') as stats,
                        JSON_EXTRACT(c.page_content, '$.trust_badge') as trust_badge
                    FROM categories c
                    WHERE c.slug = :slug AND c.is_active = 1";
    
    $categoryStmt = $db->prepare($categorySql);
    $categoryStmt->execute([':slug' => $slug]);
    $category = $categoryStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        sendResponse(false, 'Category not found', null, 404);
        return;
    }
    
    // Get sub-categories with product counts
    $subSql = "SELECT 
                    sc.*,
                    COUNT(DISTINCT p.id) as product_count
                FROM sub_categories sc
                LEFT JOIN products p ON p.sub_category = sc.name AND p.is_active = 1
                WHERE sc.category_id = :category_id AND sc.is_active = 1
                GROUP BY sc.id
                ORDER BY sc.sort_order ASC";
    
    $subStmt = $db->prepare($subSql);
    $subStmt->execute([':category_id' => $category['id']]);
    $subCategories = $subStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse JSON fields
    $category['how_to_order'] = json_decode($category['how_to_order'] ?? '[]', true);
    $category['faqs'] = json_decode($category['faqs'] ?? '[]', true);
    $category['popular_products'] = json_decode($category['popular_products'] ?? '[]', true);
    $category['stats'] = json_decode($category['stats'] ?? '{}', true);
    $category['trust_badge'] = json_decode($category['trust_badge'] ?? '{}', true);
    
    // Remove raw page_content from response (optional)
    unset($category['page_content']);
    
    sendResponse(true, 'Category details retrieved', [
        'category' => $category,
        'sub_categories' => $subCategories
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>