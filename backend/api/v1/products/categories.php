<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$productsData = json_decode(file_get_contents('../../data/products.json'), true);
$products = $productsData['products'];

// Get unique categories by service type
$categories = [
    'retail' => [],
    'wholesale' => [],
    'pod' => []
];

foreach ($products as $product) {
    $serviceType = $product['serviceType'];
    $category = $product['category'];
    $categoryName = ucfirst(str_replace('-', ' ', $category));
    
    if (!in_array($category, $categories[$serviceType])) {
        $categories[$serviceType][] = [
            'value' => $category,
            'label' => $categoryName,
            'icon' => $product['icon']
        ];
    }
}

echo json_encode(['success' => true, 'data' => $categories]);
?>