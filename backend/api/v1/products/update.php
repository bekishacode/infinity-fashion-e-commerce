<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$id = $input['id'] ?? 0;

if (!$id) {
    sendResponse(false, 'Product ID is required', null, 400);
}

// Check if product exists
$checkSql = "SELECT id FROM products WHERE id = :id";
$checkStmt = $db->prepare($checkSql);
$checkStmt->execute([':id' => $id]);

if ($checkStmt->rowCount() == 0) {
    sendResponse(false, 'Product not found', null, 404);
}

// Build update query dynamically
$updates = [];
$params = [];

if (isset($input['name'])) {
    $name = $input['name'];
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    $updates[] = "name = :name";
    $params[':name'] = $name;
    $updates[] = "slug = :slug";
    $params[':slug'] = $slug;
}
if (isset($input['price'])) {
    $updates[] = "price = :price";
    $params[':price'] = $input['price'];
}
if (isset($input['compare_price'])) {
    $updates[] = "compare_price = :compare_price";
    $params[':compare_price'] = $input['compare_price'];
}
if (isset($input['icon'])) {
    $updates[] = "icon = :icon";
    $params[':icon'] = $input['icon'];
}
if (isset($input['service_type'])) {
    $updates[] = "service_type = :service_type";
    $params[':service_type'] = $input['service_type'];
}
if (isset($input['category'])) {
    $updates[] = "category = :category";
    $params[':category'] = $input['category'];
}
if (isset($input['sub_category'])) {
    $updates[] = "sub_category = :sub_category";
    $params[':sub_category'] = $input['sub_category'];
}
if (isset($input['badge'])) {
    $updates[] = "badge = :badge";
    $params[':badge'] = $input['badge'];
}
if (isset($input['badge_color'])) {
    $updates[] = "badge_color = :badge_color";
    $params[':badge_color'] = $input['badge_color'];
}
if (isset($input['rating'])) {
    $updates[] = "rating = :rating";
    $params[':rating'] = $input['rating'];
}
if (isset($input['review_count'])) {
    $updates[] = "review_count = :review_count";
    $params[':review_count'] = $input['review_count'];
}
if (isset($input['min_quantity'])) {
    $updates[] = "min_quantity = :min_quantity";
    $params[':min_quantity'] = $input['min_quantity'];
}
if (isset($input['description'])) {
    $updates[] = "description = :description";
    $params[':description'] = $input['description'];
}
if (isset($input['material'])) {
    $updates[] = "material = :material";
    $params[':material'] = $input['material'];
}
if (isset($input['care_instructions'])) {
    $updates[] = "care_instructions = :care_instructions";
    $params[':care_instructions'] = $input['care_instructions'];
}
if (isset($input['weight'])) {
    $updates[] = "weight = :weight";
    $params[':weight'] = $input['weight'];
}
if (isset($input['in_stock'])) {
    $updates[] = "in_stock = :in_stock";
    $params[':in_stock'] = $input['in_stock'];
}
if (isset($input['is_featured'])) {
    $updates[] = "is_featured = :is_featured";
    $params[':is_featured'] = $input['is_featured'];
}
if (isset($input['is_active'])) {
    $updates[] = "is_active = :is_active";
    $params[':is_active'] = $input['is_active'];
}

if (empty($updates)) {
    sendResponse(false, 'No fields to update', null, 400);
}

$params[':id'] = $id;
$sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = :id";
$stmt = $db->prepare($sql);
$result = $stmt->execute($params);

if ($result) {
    // Update images if provided
    if (isset($input['images']) && is_array($input['images'])) {
        // Delete old images
        $deleteSql = "DELETE FROM product_images WHERE product_id = :product_id";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->execute([':product_id' => $id]);
        
        // Insert new images
        $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
                   VALUES (:product_id, :image_url, :is_primary, :sort_order)";
        $imgStmt = $db->prepare($imgSql);
        
        foreach ($input['images'] as $index => $image_url) {
            $is_primary = ($index == 0) ? 1 : 0;
            $imgStmt->execute([
                ':product_id' => $id,
                ':image_url' => $image_url,
                ':is_primary' => $is_primary,
                ':sort_order' => $index
            ]);
        }
    }
    
    sendResponse(true, "Product updated successfully");
} else {
    sendResponse(false, "Failed to update product", null, 500);
}
?>