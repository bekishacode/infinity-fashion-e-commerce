<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get filters
$service = isset($_GET['service']) ? $_GET['service'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Pagination parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

// Validate pagination
if ($page < 1) $page = 1;
if ($limit < 1) $limit = 20;
if ($limit > 100) $limit = 100; // Max 100 items per page

// Build WHERE clause
$where = "WHERE is_active = 1";
$params = [];
$types = "";

if ($service && $service != 'all') {
    $where .= " AND service_type = ?";
    $params[] = $service;
    $types .= "s";
}

if ($category && $category != 'all') {
    $where .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($search) {
    $where .= " AND (name LIKE ? OR description LIKE ?)";
    $searchParam = "%$search%";
    $params[] = $searchParam;
    $params[] = $searchParam;
    $types .= "ss";
}

// ============================================
// 1. Get TOTAL COUNT for pagination
// ============================================
$countSql = "SELECT COUNT(*) as total FROM products $where";
$countStmt = $db->prepare($countSql);

if (!empty($params)) {
    $countStmt->bind_param($types, ...$params);
}

$countStmt->execute();
$countResult = $countStmt->get_result();
$total = $countResult->fetch_assoc()['total'];
$totalPages = ceil($total / $limit);

// ============================================
// 2. Get PRODUCTS for current page
// ============================================
$sql = "SELECT * FROM products $where ORDER BY id DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

$stmt = $db->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[$row['id']] = $row;
    $products[$row['id']]['images'] = [];
}

// ============================================
// 3. Get ALL images for these products (ONE query)
// ============================================
if (!empty($products)) {
    $productIds = array_keys($products);
    $idsString = implode(',', $productIds);
    
    $imgSql = "SELECT product_id, image_url, is_primary, sort_order 
               FROM product_images 
               WHERE product_id IN ($idsString) 
               ORDER BY product_id, sort_order";
    $imgResult = $db->query($imgSql);
    
    while ($imgRow = $imgResult->fetch_assoc()) {
        $products[$imgRow['product_id']]['images'][] = $imgRow['image_url'];
    }
}

// Convert to indexed array
$productsArray = array_values($products);

// ============================================
// 4. Return response with pagination info
// ============================================
sendResponse(true, "Products retrieved successfully", [
    'products' => $productsArray,
    'pagination' => [
        'current_page' => $page,
        'per_page' => $limit,
        'total' => $total,
        'total_pages' => $totalPages,
        'has_next' => $page < $totalPages,
        'has_previous' => $page > 1
    ]
]);
?>