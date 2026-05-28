<?php
// Get the requesting origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Define allowed origins (your Vercel frontend URLs)
$allowed_origins = [
    'https://infinity-fashion-e-commerce.vercel.app',
    'https://infinity-fashion-e-commerce-git-main-bereket-fikres-projects.vercel.app',
    'http://localhost:3000',  // For local development
    'http://localhost:3001'   // Alternative local port
];

// CORS headers - MUST be first
header('Access-Control-Allow-Origin: https://infinity-fashion-e-commerce.vercel.app');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rest of your code...
$dataFile = dirname(__DIR__, 3) . '/data/products.json';

if (!file_exists($dataFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Data file not found',
        'data' => []
    ]);
    exit;
}

$jsonContent = file_get_contents($dataFile);
$productsData = json_decode($jsonContent, true);

if (!$productsData || !isset($productsData['products'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid data format',
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