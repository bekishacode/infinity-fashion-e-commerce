<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Required fields
$name = $input['name'] ?? '';
$price = $input['price'] ?? 0;
$service_type = $input['service_type'] ?? '';
$category = $input['category'] ?? '';

if (!$name || !$price || !$service_type || !$category) {
    sendResponse(false, 'Name, price, service_type, and category are required', null, 400);
}

// Generate slug from name
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

// Optional fields
$compare_price = $input['compare_price'] ?? null;
$icon = $input['icon'] ?? null;
$sub_category = $input['sub_category'] ?? null;
$badge = $input['badge'] ?? null;
$badge_color = $input['badge_color'] ?? null;
$rating = $input['rating'] ?? 0;
$review_count = $input['review_count'] ?? 0;
$min_quantity = $input['min_quantity'] ?? 1;
$description = $input['description'] ?? null;
$material = $input['material'] ?? null;
$care_instructions = $input['care_instructions'] ?? null;
$weight = $input['weight'] ?? null;
$in_stock = $input['in_stock'] ?? 1;
$is_featured = $input['is_featured'] ?? 0;
$is_active = $input['is_active'] ?? 1;
$images = $input['images'] ?? []; // Array of image URLs

$sql = "INSERT INTO products (
    name, slug, price, compare_price, icon, service_type, category, sub_category,
    badge, badge_color, rating, review_count, min_quantity, description, 
    material, care_instructions, weight, in_stock, is_featured, is_active
) VALUES (
    '$name', '$slug', $price, " . ($compare_price ? $compare_price : "NULL") . ", 
    " . ($icon ? "'$icon'" : "NULL") . ", '$service_type', '$category', " . ($sub_category ? "'$sub_category'" : "NULL") . ",
    " . ($badge ? "'$badge'" : "NULL") . ", " . ($badge_color ? "'$badge_color'" : "NULL") . ", 
    $rating, $review_count, $min_quantity, " . ($description ? "'$description'" : "NULL") . ",
    " . ($material ? "'$material'" : "NULL") . ", " . ($care_instructions ? "'$care_instructions'" : "NULL") . ", 
    " . ($weight ? $weight : "NULL") . ", $in_stock, $is_featured, $is_active
)";

if ($db->query($sql)) {
    $product_id = $db->insert_id;
    
    // Insert images
    if (!empty($images)) {
        foreach ($images as $index => $image_url) {
            $is_primary = ($index == 0) ? 1 : 0;
            $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
                       VALUES ($product_id, '$image_url', $is_primary, $index)";
            $db->query($imgSql);
        }
    }
    
    sendResponse(true, "Product created successfully", ["id" => $product_id, "slug" => $slug]);
} else {
    sendResponse(false, "Failed to create product: " . $db->error, null, 500);
}
?>