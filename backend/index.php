<?php
// ============================================
// COMPLETE WORKING SOLUTION FOR RENDER
// ============================================

// Enable error reporting for debugging (remove after fixed)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://infinity-fashion-e-commerce.vercel.app',
    'https://infinity-fashion-e-commerce-git-main-bereket-fikres-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
}

header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash for easier matching
$path = ltrim($path, '/');

// Log for debugging (check Render logs)
error_log("Request path: " . $path);

// ============================================
// ROUTING - Direct file includes
// ============================================

// Root endpoint
if ($path === '' || $path === 'index.php') {
    echo json_encode([
        'success' => true,
        'message' => 'API is running',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Products list endpoint (was index.php)
if ($path === 'api/v1/products/index.php' || $path === 'api/v1/products/') {
    require_once __DIR__ . '/api/v1/products/index.php';
    exit();
}

// Get single product
if ($path === 'api/v1/products/get.php') {
    require_once __DIR__ . '/api/v1/products/get.php';
    exit();
}

// Categories endpoint
if ($path === 'api/v1/products/categories.php') {
    require_once __DIR__ . '/api/v1/products/categories.php';
    exit();
}

// If no route matched
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found',
    'requested_path' => $path,
    'available_endpoints' => [
        '/',
        '/api/v1/products/index.php',
        '/api/v1/products/get.php',
        '/api/v1/products/categories.php'
    ]
]);
?>