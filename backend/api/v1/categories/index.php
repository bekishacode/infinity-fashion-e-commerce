<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$service_type = $_GET['service_type'] ?? null;

try {
    $sql = "SELECT 
                c.*,
                COUNT(DISTINCT p.id) as product_count,
                GROUP_CONCAT(DISTINCT st.name) as service_types
            FROM categories c
            LEFT JOIN service_types st ON st.id = c.service_type_id
            LEFT JOIN products p ON p.category = c.name 
                AND p.service_type = st.name
                AND p.is_active = 1
            WHERE c.is_active = 1";
    
    $params = [];
    if ($service_type) {
        $sql .= " AND st.name = :service_type";
        $params[':service_type'] = $service_type;
    }
    
    $sql .= " GROUP BY c.id ORDER BY c.sort_order ASC";
    
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process service_types string to array
    foreach ($categories as &$category) {
        $category['service_types'] = $category['service_types'] ? explode(',', $category['service_types']) : [];
    }
    
    sendResponse(true, 'Categories retrieved', $categories);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>