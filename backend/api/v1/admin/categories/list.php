<?php
// backend/api/v1/admin/categories/list.php
require_once __DIR__ . '/../../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $sql = "SELECT id, name, display_name, slug, is_active, sort_order
            FROM categories 
            WHERE is_active = 1
            ORDER BY sort_order ASC, display_name ASC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Categories retrieved', $categories);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>