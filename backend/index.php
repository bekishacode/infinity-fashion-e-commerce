<?php
// Simple router to handle all API requests
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/backend/', '', parse_url($request_uri, PHP_URL_PATH));
$path = ltrim($path, '/');

// Route to appropriate file
$basePath = __DIR__ . '/api/v1/';
$filePath = $basePath . $path . '.php';

if (file_exists($filePath)) {
    require_once $filePath;
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Endpoint not found"]);
}
?>