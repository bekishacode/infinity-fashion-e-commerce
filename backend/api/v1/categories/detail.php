<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$slug = $_GET['slug'] ?? null;
$service_type = $_GET['service_type'] ?? null;

if (!$slug) {
    sendResponse(false, 'Category slug required', null, 400);
}

try {
    // Build query with optional service type filter
    $categorySql = "SELECT * FROM categories WHERE slug = :slug AND is_active = 1";
    $params = [':slug' => $slug];
    
    if ($service_type) {
        $serviceTypeMap = [
            'retail' => 1,
            'wholesale' => 2,
            'pod' => 3
        ];
        $serviceTypeId = $serviceTypeMap[$service_type] ?? null;
        if ($serviceTypeId) {
            $categorySql .= " AND service_type_id = :service_type_id";
            $params[':service_type_id'] = $serviceTypeId;
        }
    }
    
    $categoryStmt = $db->prepare($categorySql);
    $categoryStmt->execute($params);
    $category = $categoryStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        sendResponse(false, 'Category not found', null, 404);
    }
    
    // Get sub-categories
    $subSql = "SELECT 
                    sc.*,
                    COUNT(DISTINCT p.id) as product_count
                FROM sub_categories sc
                LEFT JOIN products p ON p.sub_category = sc.name 
                    AND p.is_active = 1
                    AND p.service_type = :service_type_val
                WHERE sc.category_id = :category_id AND sc.is_active = 1
                GROUP BY sc.id
                ORDER BY sc.sort_order ASC";
    
    $subStmt = $db->prepare($subSql);
    $serviceTypeVal = $service_type ?: 'retail';
    $subStmt->execute([
        ':category_id' => $category['id'],
        ':service_type_val' => $serviceTypeVal
    ]);
    $subCategories = $subStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Category details retrieved', [
        'category' => $category,
        'sub_categories' => $subCategories
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>