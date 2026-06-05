<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $id = $_GET['id'] ?? 0;
    
    if ($id) {
        // Get single product
        $sql = "SELECT p.*, 
                GROUP_CONCAT(pi.image_url) as images
                FROM products p
                LEFT JOIN product_images pi ON p.id = pi.product_id
                WHERE p.id = ?
                GROUP BY p.id";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
            sendResponse(true, 'Product retrieved', $row);
        } else {
            sendResponse(false, 'Product not found', null, 404);
        }
    } else {
        // Get all products with improved filtering
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $show_inactive = isset($_GET['show_inactive']) ? $_GET['show_inactive'] : null;
        
        // Build WHERE clause based on show_inactive parameter
        if ($show_inactive === 'true') {
            // Show all products (both active and inactive)
            $where = "WHERE 1=1";
        } elseif ($show_inactive === 'false') {
            // Show only active products
            $where = "WHERE is_active = 1";
        } else {
            // Default: show only active products
            $where = "WHERE is_active = 1";
        }
        
        // Add search condition
        if (!empty($search)) {
            $where .= " AND (name LIKE '%$search%' OR description LIKE '%$search%')";
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM products $where";
        $countResult = $db->query($countSql);
        $total = $countResult->fetch_assoc()['total'];
        
        // Get products with pagination
        $sql = "SELECT p.*, 
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as primary_image
                FROM products p
                $where
                ORDER BY p.id DESC
                LIMIT $offset, $limit";
        $result = $db->query($sql);
        $products = [];
        
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        
        sendResponse(true, 'Products retrieved', [
            'products' => $products,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }
} elseif ($method === 'POST') {
    // Check if it's a restore action
    if (isset($input['action']) && $input['action'] === 'restore') {
        $id = $_GET['id'] ?? 0;
        if (!$id) {
            sendResponse(false, 'Product ID required', null, 400);
        }
        $sql = "UPDATE products SET is_active = 1 WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            sendResponse(true, 'Product restored successfully');
        } else {
            sendResponse(false, 'Failed to restore product', null, 500);
        }
    } else {
        // CREATE NEW PRODUCT
        $name = $input['name'] ?? '';
        $price = $input['price'] ?? 0;
        $service_type = $input['service_type'] ?? '';
        $category = $input['category'] ?? '';
        $description = $input['description'] ?? '';
        $compare_price = $input['compare_price'] ?? null;
        $badge = $input['badge'] ?? null;
        $badge_color = $input['badge_color'] ?? null;
        $material = $input['material'] ?? null;
        $min_quantity = $input['min_quantity'] ?? 1;
        $in_stock = $input['in_stock'] ?? true;
        $is_featured = $input['is_featured'] ?? false;
        
        // Validate required fields
        if (!$name || !$price || !$service_type || !$category) {
            sendResponse(false, 'Name, price, service_type, and category are required', null, 400);
        }
        
        // Generate slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        // Insert product
        $sql = "INSERT INTO products (name, slug, price, compare_price, service_type, category, description, badge, badge_color, material, min_quantity, in_stock, is_featured) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $db->prepare($sql);
        $stmt->bind_param("ssddssssssiii", 
            $name, $slug, $price, $compare_price, $service_type, $category, 
            $description, $badge, $badge_color, $material, $min_quantity, $in_stock, $is_featured
        );
        
        if ($stmt->execute()) {
            $product_id = $db->insert_id;
            
            // Insert images if provided
            if (!empty($input['images']) && is_array($input['images'])) {
                $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)";
                $imgStmt = $db->prepare($imgSql);
                
                foreach ($input['images'] as $index => $image_url) {
                    $is_primary = ($index == 0) ? 1 : 0;
                    $imgStmt->bind_param("isii", $product_id, $image_url, $is_primary, $index);
                    $imgStmt->execute();
                }
                $imgStmt->close();
            }
            
            sendResponse(true, "Product created successfully", ['id' => $product_id]);
        } else {
            sendResponse(false, "Failed to create product: " . $db->error, null, 500);
        }
        $stmt->close();
    }
} elseif ($method === 'PUT') {
    // UPDATE PRODUCT
    $id = $_GET['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Product ID required', null, 400);
    }
    
    $updates = [];
    $params = [];
    $types = "";
    
    if (isset($input['name'])) {
        $updates[] = "name = ?";
        $params[] = $input['name'];
        $types .= "s";
        
        // Also update slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));
        $updates[] = "slug = ?";
        $params[] = $slug;
        $types .= "s";
    }
    if (isset($input['price'])) {
        $updates[] = "price = ?";
        $params[] = $input['price'];
        $types .= "d";
    }
    if (isset($input['compare_price'])) {
        $updates[] = "compare_price = ?";
        $params[] = $input['compare_price'];
        $types .= "d";
    }
    if (isset($input['service_type'])) {
        $updates[] = "service_type = ?";
        $params[] = $input['service_type'];
        $types .= "s";
    }
    if (isset($input['category'])) {
        $updates[] = "category = ?";
        $params[] = $input['category'];
        $types .= "s";
    }
    if (isset($input['description'])) {
        $updates[] = "description = ?";
        $params[] = $input['description'];
        $types .= "s";
    }
    if (isset($input['badge'])) {
        $updates[] = "badge = ?";
        $params[] = $input['badge'];
        $types .= "s";
    }
    if (isset($input['badge_color'])) {
        $updates[] = "badge_color = ?";
        $params[] = $input['badge_color'];
        $types .= "s";
    }
    if (isset($input['material'])) {
        $updates[] = "material = ?";
        $params[] = $input['material'];
        $types .= "s";
    }
    if (isset($input['min_quantity'])) {
        $updates[] = "min_quantity = ?";
        $params[] = $input['min_quantity'];
        $types .= "i";
    }
    if (isset($input['in_stock'])) {
        $updates[] = "in_stock = ?";
        $params[] = $input['in_stock'];
        $types .= "i";
    }
    if (isset($input['is_featured'])) {
        $updates[] = "is_featured = ?";
        $params[] = $input['is_featured'];
        $types .= "i";
    }
    
    if (empty($updates)) {
        sendResponse(false, 'No fields to update', null, 400);
    }
    
    $params[] = $id;
    $types .= "i";
    
    $sql = "UPDATE products SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Update images if provided
        if (isset($input['images']) && is_array($input['images'])) {
            // Delete old images
            $deleteSql = "DELETE FROM product_images WHERE product_id = ?";
            $deleteStmt = $db->prepare($deleteSql);
            $deleteStmt->bind_param("i", $id);
            $deleteStmt->execute();
            $deleteStmt->close();
            
            // Insert new images
            $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)";
            $imgStmt = $db->prepare($imgSql);
            
            foreach ($input['images'] as $index => $image_url) {
                $is_primary = ($index == 0) ? 1 : 0;
                $imgStmt->bind_param("isii", $id, $image_url, $is_primary, $index);
                $imgStmt->execute();
            }
            $imgStmt->close();
        }
        
        sendResponse(true, "Product updated successfully");
    } else {
        sendResponse(false, "Failed to update product: " . $db->error, null, 500);
    }
    $stmt->close();
    
} elseif ($method === 'DELETE') {
    // DELETE PRODUCT
    $id = $_GET['id'] ?? 0;
    $permanent = $_GET['permanent'] ?? false;
    
    if (!$id) {
        sendResponse(false, 'Product ID required', null, 400);
    }
    
    if ($permanent === 'true' || $permanent === true) {
        // Permanent delete - first check if product has orders
        $checkSql = "SELECT COUNT(*) as order_count FROM orders WHERE product_id = ?";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $orderCount = $checkResult->fetch_assoc()['order_count'];
        $checkStmt->close();
        
        if ($orderCount > 0) {
            sendResponse(false, "Cannot permanently delete product with $orderCount order(s). Soft delete only.", null, 400);
        }
        
        $sql = "DELETE FROM products WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(true, "Product permanently deleted");
        } else {
            sendResponse(false, "Failed to delete product", null, 500);
        }
        $stmt->close();
    } else {
        // Soft delete (move to trash)
        $sql = "UPDATE products SET is_active = 0 WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(true, "Product moved to trash");
        } else {
            sendResponse(false, "Failed to trash product", null, 500);
        }
        $stmt->close();
    }
}
?>