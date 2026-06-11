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

// Build WHERE clause and parameters
$where = "WHERE is_active = 1";
$params = [];

if ($service && $service != 'all') {
    $where .= " AND service_type = :service";
    $params[':service'] = $service;
}

if ($category && $category != 'all') {
    $where .= " AND category = :category";
    $params[':category'] = $category;
}

if ($search) {
    $where .= " AND (name LIKE :search OR description LIKE :search)";
    $params[':search'] = "%$search%";
}

// ============================================
// 1. Get TOTAL COUNT for pagination
// ============================================
$countSql = "SELECT COUNT(*) as total FROM products $where";
$countStmt = $db->prepare($countSql);
foreach ($params as $key => &$val) {
    $countStmt->bindParam($key, $val);
}
$countStmt->execute();
$total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
$totalPages = ceil($total / $limit);

// ============================================
// 2. Get PRODUCTS for current page
// ============================================
$sql = "SELECT * FROM products $where ORDER BY id DESC LIMIT :limit OFFSET :offset";
$stmt = $db->prepare($sql);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
foreach ($params as $key => &$val) {
    $stmt->bindParam($key, $val);
}
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$products = [];
foreach ($rows as $row) {
    $products[$row['id']] = $row;
    $products[$row['id']]['images'] = [];
}

// ============================================
// 3. Get ALL images for these products (ONE query)
// ============================================
if (!empty($products)) {
    $productIds = array_keys($products);
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));
    
    $imgSql = "SELECT product_id, image_url, is_primary, sort_order 
               FROM product_images 
               WHERE product_id IN ($placeholders) 
               ORDER BY product_id, sort_order";
    $imgStmt = $db->prepare($imgSql);
    
    // Bind each product ID
    foreach ($productIds as $idx => $id) {
        $imgStmt->bindValue($idx + 1, $id, PDO::PARAM_INT);
    }
    $imgStmt->execute();
    $imgRows = $imgStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($imgRows as $imgRow) {
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