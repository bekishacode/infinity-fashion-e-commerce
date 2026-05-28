<?php
// Get product by ID

$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$productId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Product ID is required'
    ]);
    exit;
}

// ============================================
// FIXED PATH FOR RENDER
// ============================================
$dataFile = __DIR__ . '/../../data/products.json';

// Alternative paths
if (!file_exists($dataFile)) {
    $dataFile = $_SERVER['DOCUMENT_ROOT'] . '/data/products.json';
}
if (!file_exists($dataFile)) {
    $dataFile = dirname(__DIR__, 2) . '/data/products.json';
}

if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Products data file not found',
        'debug_path' => $dataFile
    ]);
    exit;
}

$jsonContent = file_get_contents($dataFile);
$productsData = json_decode($jsonContent, true);
$products = $productsData['products'];

// Find product
$product = null;
foreach ($products as $p) {
    if ($p['id'] === $productId) {
        $product = $p;
        break;
    }
}

if (!$product) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Product not found'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $product
]);
?>