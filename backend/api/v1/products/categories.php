<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$sql = "SELECT DISTINCT category FROM products WHERE is_active = 1";
$result = $db->query($sql);
$categories = [];

while ($row = $result->fetch_assoc()) {
    $categories[] = $row['category'];
}

sendResponse(true, "Categories retrieved successfully", $categories);
?>