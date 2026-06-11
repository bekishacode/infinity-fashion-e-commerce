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
                WHERE p.id = :id
                GROUP BY p.id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
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
            $where = "WHERE 1=1";
        } elseif ($show_inactive === 'false') {
            $where = "WHERE is_active = 1";
        } else {
            $where = "WHERE is_active = 1";
        }
        
        // Add search condition
        $params = [];
        if (!empty($search)) {
            $where .= " AND (name LIKE :search OR description LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM products $where";
        $countStmt = $db->prepare($countSql);
        foreach ($params as $key => &$val) {
            $countStmt->bindParam($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get products with pagination
        $sql = "SELECT p.*, 
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as primary_image
                FROM products p
                $where
                ORDER BY p.id DESC
                LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
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
        $sql = "UPDATE products SET is_active = 1 WHERE id = :id";
        $stmt = $db->prepare($sql);
        if ($stmt->execute([':id' => $id])) {
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
        $sub_category = $input['sub_category'] ?? null;
        $description = $input['description'] ?? '';
        $compare_price = $input['compare_price'] ?? null;
        $badge = $input['badge'] ?? null;
        $badge_color = $input['badge_color'] ?? null;
        $material = $input['material'] ?? null;
        $min_quantity = $input['min_quantity'] ?? 1;
        $in_stock = isset($input['in_stock']) ? (int)$input['in_stock'] : 1;
        $is_featured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
        
        // Validate required fields
        if (!$name || !$price || !$service_type || !$category) {
            sendResponse(false, 'Name, price, service_type, and category are required', null, 400);
        }
        
        // Generate slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        
        // Insert product
        $sql = "INSERT INTO products (
            name, slug, price, compare_price, service_type, category, sub_category, description, 
            badge, badge_color, material, min_quantity, in_stock, is_featured
        ) VALUES (
            :name, :slug, :price, :compare_price, :service_type, :category, :sub_category, :description,
            :badge, :badge_color, :material, :min_quantity, :in_stock, :is_featured
        )";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':name' => $name,
            ':slug' => $slug,
            ':price' => $price,
            ':compare_price' => $compare_price,
            ':service_type' => $service_type,
            ':category' => $category,
            ':sub_category' => $sub_category,
            ':description' => $description,
            ':badge' => $badge,
            ':badge_color' => $badge_color,
            ':material' => $material,
            ':min_quantity' => $min_quantity,
            ':in_stock' => $in_stock,
            ':is_featured' => $is_featured
        ]);
        
        if ($result) {
            $product_id = $db->lastInsertId();
            
            // Insert images if provided
            if (!empty($input['images']) && is_array($input['images'])) {
                $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (:product_id, :image_url, :is_primary, :sort_order)";
                $imgStmt = $db->prepare($imgSql);
                
                foreach ($input['images'] as $index => $image_url) {
                    $is_primary = ($index == 0) ? 1 : 0;
                    $imgStmt->execute([
                        ':product_id' => $product_id,
                        ':image_url' => $image_url,
                        ':is_primary' => $is_primary,
                        ':sort_order' => $index
                    ]);
                }
            }
            
            sendResponse(true, "Product created successfully", ['id' => $product_id]);
        } else {
            sendResponse(false, "Failed to create product", null, 500);
        }
    }
} elseif ($method === 'PUT') {
    // UPDATE PRODUCT
    $id = $_GET['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Product ID required', null, 400);
    }
    
    $updates = [];
    $params = [];
    
    if (isset($input['name'])) {
        $updates[] = "name = :name";
        $params[':name'] = $input['name'];
        
        // Also update slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));
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
    if (isset($input['service_type'])) {
        $updates[] = "service_type = :service_type";
        $params[':service_type'] = $input['service_type'];
    }
    if (isset($input['category'])) {
        $updates[] = "category = :category";
        $params[':category'] = $input['category'];
    }
    if (isset($input['description'])) {
        $updates[] = "description = :description";
        $params[':description'] = $input['description'];
    }
    if (isset($input['badge'])) {
        $updates[] = "badge = :badge";
        $params[':badge'] = $input['badge'];
    }
    if (isset($input['badge_color'])) {
        $updates[] = "badge_color = :badge_color";
        $params[':badge_color'] = $input['badge_color'];
    }
    if (isset($input['material'])) {
        $updates[] = "material = :material";
        $params[':material'] = $input['material'];
    }
    if (isset($input['min_quantity'])) {
        $updates[] = "min_quantity = :min_quantity";
        $params[':min_quantity'] = $input['min_quantity'];
    }
    if (isset($input['in_stock'])) {
        $updates[] = "in_stock = :in_stock";
        $params[':in_stock'] = $input['in_stock'];
    }
    if (isset($input['is_featured'])) {
        $updates[] = "is_featured = :is_featured";
        $params[':is_featured'] = $input['is_featured'];
    }
    
    if (empty($updates)) {
        sendResponse(false, 'No fields to update', null, 400);
    }
    
    $params[':id'] = $id;
    $sql = "UPDATE products SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($params)) {
        // Update images if provided
        if (isset($input['images']) && is_array($input['images'])) {
            // Delete old images
            $deleteSql = "DELETE FROM product_images WHERE product_id = :product_id";
            $deleteStmt = $db->prepare($deleteSql);
            $deleteStmt->execute([':product_id' => $id]);
            
            // Insert new images
            $imgSql = "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (:product_id, :image_url, :is_primary, :sort_order)";
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
    
} elseif ($method === 'DELETE') {
    // DELETE PRODUCT
    $id = $_GET['id'] ?? 0;
    $permanent = $_GET['permanent'] ?? false;
    
    if (!$id) {
        sendResponse(false, 'Product ID required', null, 400);
    }
    
    if ($permanent === 'true' || $permanent === true) {
        // Permanent delete - first check if product has orders
        $checkSql = "SELECT COUNT(*) as order_count FROM orders WHERE product_id = :product_id";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([':product_id' => $id]);
        $orderCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['order_count'];
        
        if ($orderCount > 0) {
            sendResponse(false, "Cannot permanently delete product with $orderCount order(s). Soft delete only.", null, 400);
        }
        
        $sql = "DELETE FROM products WHERE id = :id";
        $stmt = $db->prepare($sql);
        
        if ($stmt->execute([':id' => $id])) {
            sendResponse(true, "Product permanently deleted");
        } else {
            sendResponse(false, "Failed to delete product", null, 500);
        }
    } else {
        // Soft delete (move to trash)
        $sql = "UPDATE products SET is_active = 0 WHERE id = :id";
        $stmt = $db->prepare($sql);
        
        if ($stmt->execute([':id' => $id])) {
            sendResponse(true, "Product moved to trash");
        } else {
            sendResponse(false, "Failed to trash product", null, 500);
        }
    }
}
?>