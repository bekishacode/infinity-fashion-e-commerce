<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$sql = "SELECT DISTINCT category FROM products WHERE is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$categories = [];
foreach ($results as $row) {
    $categories[] = $row['category'];
}

sendResponse(true, "Categories retrieved successfully", $categories);
?>