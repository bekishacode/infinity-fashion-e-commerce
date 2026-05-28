<?php
// CORS headers - MUST be first thing before any output
header('Access-Control-Allow-Origin: https://infinity-fashion-e-commerce.vercel.app');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Define the data file path (absolute path for reliability)
$dataFile = dirname(__DIR__, 3) . '/data/products.json';

// Check if file exists
if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Data file not found at: ' . $dataFile,
        'data' => []
    ]);
    exit;
}

// Load product data from JSON file
$jsonContent = file_get_contents($dataFile);
$productsData = json_decode($jsonContent, true);

if (!$productsData || !isset($productsData['products'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid data format in products.json',
        'data' => []
    ]);
    exit;
}

$products = $productsData['products'];

// Get filter parameters
$serviceType = $_GET['service'] ?? 'all';
$category = $_GET['category'] ?? 'all';
$search = $_GET['search'] ?? '';
$minPrice = isset($_GET['min_price']) ? (float)$_GET['min_price'] : 0;
$maxPrice = isset($_GET['max_price']) ? (float)$_GET['max_price'] : 999999;
$sort = $_GET['sort'] ?? 'featured';

// Filter products
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

// Convert to array and re-index
$filteredProducts = array_values($filteredProducts);

// Sort products
usort($filteredProducts, function($a, $b) use ($sort) {
    switch ($sort) {
        case 'price-low':
            return $a['price'] - $b['price'];
        case 'price-high':
            return $b['price'] - $a['price'];
        case 'rating':
            return ($b['rating'] ?? 0) - ($a['rating'] ?? 0);
        case 'popular':
            return ($b['reviewCount'] ?? 0) - ($a['reviewCount'] ?? 0);
        default:
            return $a['id'] - $b['id'];
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