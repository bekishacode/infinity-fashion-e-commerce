<?php
// Get categories

$dataFile = __DIR__ . '/../../data/products.json';

if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Products data file not found'
    ]);
    exit;
}

$jsonContent = file_get_contents($dataFile);
$productsData = json_decode($jsonContent, true);
$products = $productsData['products'];

// Group categories by service type
$categories = [
    'retail' => [],
    'wholesale' => [],
    'pod' => []
];

foreach ($products as $product) {
    $serviceType = $product['serviceType'];
    $category = $product['category'];
    
    if (!in_array($category, $categories[$serviceType])) {
        $categories[$serviceType][] = $category;
    }
}

echo json_encode([
    'success' => true,
    'data' => $categories
]);
?>