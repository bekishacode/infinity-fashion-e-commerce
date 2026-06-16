<?php
require_once '../../../config/database.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $sql = "SELECT id, name, display_name, icon, sort_order, is_active 
            FROM service_types 
            WHERE is_active = 1 
            ORDER BY sort_order ASC";
    
    $stmt = $db->query($sql);
    $serviceTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Service types retrieved', $serviceTypes);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>