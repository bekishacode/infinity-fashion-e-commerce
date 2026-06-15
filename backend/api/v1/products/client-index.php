<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

try {
    $service_type = $_GET['service_type'] ?? null;
    $category = $_GET['category'] ?? null;
    $sub_category = $_GET['sub_category'] ?? null;
    $search = $_GET['search'] ?? null;
    $min_price = $_GET['min_price'] ?? null;
    $max_price = $_GET['max_price'] ?? null;
    $sort = $_GET['sort'] ?? 'newest';
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 12);
    $offset = ($page - 1) * $limit;

    // Build WHERE clause
    $whereConditions = ["p.is_active = 1"];
    $params = [];

    if ($service_type && $service_type !== 'all') {
        $whereConditions[] = "p.service_type = :service_type";
        $params[':service_type'] = $service_type;
    }

    if ($category && $category !== 'all') {
        $whereConditions[] = "p.category = :category";
        $params[':category'] = $category;
    }

    if ($sub_category && $sub_category !== 'all') {
        $whereConditions[] = "p.sub_category = :sub_category";
        $params[':sub_category'] = $sub_category;
    }

    if ($search) {
        $whereConditions[] = "(p.name LIKE :search OR p.description LIKE :search)";
        $params[':search'] = "%{$search}%";
    }

    if ($min_price !== null) {
        $whereConditions[] = "p.price >= :min_price";
        $params[':min_price'] = $min_price;
    }

    if ($max_price !== null) {
        $whereConditions[] = "p.price <= :max_price";
        $params[':max_price'] = $max_price;
    }

    $whereClause = implode(" AND ", $whereConditions);

    // Build ORDER BY clause
    $orderBy = match($sort) {
        'price_asc' => 'p.price ASC',
        'price_desc' => 'p.price DESC',
        'name_asc' => 'p.name ASC',
        'name_desc' => 'p.name DESC',
        'oldest' => 'p.created_at ASC',
        default => 'p.created_at DESC' // newest first
    };

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM products p WHERE $whereClause";
    $countStmt = $db->prepare($countSql);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get products with images and variants
    $sql = "SELECT 
                p.*,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT MIN(price_adjustment + p.price) FROM product_variants WHERE product_id = p.id AND is_active = 1) as min_variant_price,
                (SELECT MAX(price_adjustment + p.price) FROM product_variants WHERE product_id = p.id AND is_active = 1) as max_variant_price
            FROM products p
            WHERE $whereClause
            ORDER BY $orderBy
            LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get variants for each product
    foreach ($products as &$product) {
        $variantSql = "SELECT * FROM product_variants WHERE product_id = :product_id AND is_active = 1";
        $variantStmt = $db->prepare($variantSql);
        $variantStmt->execute([':product_id' => $product['id']]);
        $product['variants'] = $variantStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get all images
        $imageSql = "SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order ASC";
        $imageStmt = $db->prepare($imageSql);
        $imageStmt->execute([':product_id' => $product['id']]);
        $product['images'] = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    sendResponse(true, 'Products retrieved', [
        'products' => $products,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>