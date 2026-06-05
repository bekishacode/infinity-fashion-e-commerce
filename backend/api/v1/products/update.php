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
$checkSql = "SELECT id FROM products WHERE id = $id";
$checkResult = $db->query($checkSql);

if ($checkResult->num_rows == 0) {
    sendResponse(false, 'Product not found', null, 404);
}

// Build update query dynamically
$updates = [];

if (isset($input['name'])) {
    $name = $input['name'];
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    $updates[] = "name = '$name'";
    $updates[] = "slug = '$slug'";
}
if (isset($input['price'])) $updates[] = "price = " . $input['price'];
if (isset($input['compare_price'])) $updates[] = "compare_price = " . ($input['compare_price'] ?: "NULL");
if (isset($input['icon'])) $updates[] = "icon = " . ($input['icon'] ? "'{$input['icon']}'" : "NULL");
if (isset($input['service_type'])) $updates[] = "service_type = '{$input['service_type']}'";
if (isset($input['category'])) $updates[] = "category = '{$input['category']}'";
if (isset($input['sub_category'])) $updates[] = "sub_category = " . ($input['sub_category'] ? "'{$input['sub_category']}'" : "NULL");
if (isset($input['badge'])) $updates[] = "badge = " . ($input['badge'] ? "'{$input['badge']}'" : "NULL");
if (isset($input['badge_color'])) $updates[] = "badge_color = " . ($input['badge_color'] ? "'{$input['badge_color']}'" : "NULL");
if (isset($input['rating'])) $updates[] = "rating = " . $input['rating'];
if (isset($input['review_count'])) $updates[] = "review_count = " . $input['review_count'];
if (isset($input['min_quantity'])) $updates[] = "min_quantity = " . $input['min_quantity'];
if (isset($input['description'])) $updates[] = "description = " . ($input['description'] ? "'{$input['description']}'" : "NULL");
if (isset($input['material'])) $updates[] = "material = " . ($input['material'] ? "'{$input['material']}'" : "NULL");
if (isset($input['care_instructions'])) $updates[] = "care_instructions = " . ($input['care_instructions'] ? "'{$input['care_instructions']}'" : "NULL");
if (isset($input['weight'])) $updates[] = "weight = " . ($input['weight'] ?: "NULL");
if (isset($input['in_stock'])) $updates[] = "in_stock = " . $input['in_stock'];
if (isset($input['is_featured'])) $updates[] = "is_featured = " . $input['is_featured'];
if (isset($input['is_active'])) $updates[] = "is_active = " . $input['is_active'];

if (empty($updates)) {
    sendResponse(false, 'No fields to update', null, 400);
}

$sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = $id";

if ($db->query($sql)) {
    // Update images if provided
    if (isset($input['images']) && is_array($input['images'])) {
        // Delete old images
        $db->query("DELETE FROM product_images WHERE product_id = $id");
        
        // Insert new images
        foreach ($input['images'] as $index => $image_url) {
            $is_primary = ($index == 0) ? 1 : 0;
            $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
                       VALUES ($id, '$image_url', $is_primary, $index)";
            $db->query($imgSql);
        }
    }
    
    sendResponse(true, "Product updated successfully");
} else {
    sendResponse(false, "Failed to update product: " . $db->error, null, 500);
}
?>