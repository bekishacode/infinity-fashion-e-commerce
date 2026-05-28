<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$productId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit;
}

$productsData = json_decode(file_get_contents('../../data/products.json'), true);
$products = $productsData['products'];

$product = null;
foreach ($products as $p) {
    if ($p['id'] === $productId) {
        $product = $p;
        break;
    }
}

if (!$product) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Product not found']);
    exit;
}

echo json_encode(['success' => true, 'data' => $product]);
?>