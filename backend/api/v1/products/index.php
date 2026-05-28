<?php
// This file is included by the main index.php router

// ============================================
// FIXED PATH FOR RENDER
// ============================================
$dataFile = __DIR__ . '/../../data/products.json';

// Alternative: Try multiple possible paths
if (!file_exists($dataFile)) {
    // Try absolute path from document root
    $dataFile = $_SERVER['DOCUMENT_ROOT'] . '/data/products.json';
}
if (!file_exists($dataFile)) {
    // Try relative to current file
    $dataFile = dirname(__DIR__, 2) . '/data/products.json';
}
if (!file_exists($dataFile)) {
    // Try one more level up
    $dataFile = dirname(__DIR__, 3) . '/data/products.json';
}

// Debug: Log the path we're trying
error_log("Looking for products.json at: " . $dataFile);

if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Products data file not found',
        'debug_path' => $dataFile,
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'current_dir' => __DIR__
    ]);
    exit;
}

// Read products
$jsonContent = file_get_contents($dataFile);
$productsData = json_decode($jsonContent, true);

if (!$productsData || !isset($productsData['products'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid products data format'
    ]);
    exit;
}

$products = $productsData['products'];

// Get filters
$serviceType = $_GET['service'] ?? 'all';
$category = $_GET['category'] ?? 'all';
$search = $_GET['search'] ?? '';
$minPrice = isset($_GET['min_price']) ? (float)$_GET['min_price'] : 0;
$maxPrice = isset($_GET['max_price']) ? (float)$_GET['max_price'] : 999999;
$sort = $_GET['sort'] ?? 'featured';

// Apply filters
$filteredProducts = array_filter($products, function($product) use ($serviceType, $category, $search, $minPrice, $maxPrice) {
    if ($serviceType !== 'all' && $product['serviceType'] !== $serviceType) {
        return false;
    }
    if ($category !== 'all' && $product['category'] !== $category) {
        return false;
    }
    if (!empty($search) && stripos($product['name'], $search) === false) {
        return false;
    }
    if ($product['price'] < $minPrice || $product['price'] > $maxPrice) {
        return false;
    }
    return true;
});

$filteredProducts = array_values($filteredProducts);

// Apply sorting
usort($filteredProducts, function($a, $b) use ($sort) {
    switch ($sort) {
        case 'price-low':
            return $a['price'] <=> $b['price'];
        case 'price-high':
            return $b['price'] <=> $a['price'];
        case 'rating':
            return ($b['rating'] ?? 0) <=> ($a['rating'] ?? 0);
        default:
            return $a['id'] <=> $b['id'];
    }
});

// Return response
echo json_encode([
    'success' => true,
    'data' => $filteredProducts,
    'total' => count($filteredProducts),
    'filters' => [
        'service' => $serviceType,
        'category' => $category,
        'search' => $search,
        'min_price' => $minPrice,
        'max_price' => $maxPrice,
        'sort' => $sort
    ]
]);
?>