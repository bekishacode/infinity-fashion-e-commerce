<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get picklist type from URL
$type = isset($_GET['type']) ? $_GET['type'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($method === 'GET') {
    if ($type === 'service-types') {
        $sql = "SELECT * FROM service_types WHERE is_active = 1 ORDER BY sort_order";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, 'Service types retrieved', $result);
        
    } elseif ($type === 'categories') {
        $serviceTypeId = isset($_GET['service_type_id']) ? (int)$_GET['service_type_id'] : 0;
        if ($serviceTypeId) {
            $sql = "SELECT * FROM categories WHERE service_type_id = :service_type_id AND is_active = 1 ORDER BY sort_order";
            $stmt = $db->prepare($sql);
            $stmt->execute([':service_type_id' => $serviceTypeId]);
        } else {
            $sql = "SELECT c.*, st.name as service_type_name 
                    FROM categories c 
                    JOIN service_types st ON c.service_type_id = st.id 
                    WHERE c.is_active = 1 
                    ORDER BY st.sort_order, c.sort_order";
            $stmt = $db->prepare($sql);
            $stmt->execute();
        }
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, 'Categories retrieved', $result);
        
    } elseif ($type === 'sub-categories') {
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
        if ($categoryId) {
            $sql = "SELECT * FROM sub_categories WHERE category_id = :category_id AND is_active = 1 ORDER BY sort_order";
            $stmt = $db->prepare($sql);
            $stmt->execute([':category_id' => $categoryId]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $sql = "SELECT sc.*, c.name as category_name, st.name as service_type_name 
                    FROM sub_categories sc 
                    JOIN categories c ON sc.category_id = c.id 
                    JOIN service_types st ON c.service_type_id = st.id 
                    WHERE sc.is_active = 1 
                    ORDER BY st.sort_order, c.sort_order, sc.sort_order";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        sendResponse(true, 'Sub-categories retrieved', $result);
    }
    
} elseif ($method === 'POST') {
    // Only super admin can manage picklists
    if ($admin['role'] !== 'super_admin') {
        sendResponse(false, 'Access denied', null, 403);
    }
    
    if ($type === 'service-types') {
        $name = $input['name'] ?? '';
        $display_name = $input['display_name'] ?? '';
        $icon = $input['icon'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        
        if (!$name || !$display_name) {
            sendResponse(false, 'Name and display name are required', null, 400);
        }
        
        $sql = "INSERT INTO service_types (name, display_name, icon, sort_order) VALUES (:name, :display_name, :icon, :sort_order)";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':name' => $name,
            ':display_name' => $display_name,
            ':icon' => $icon,
            ':sort_order' => $sort_order
        ]);
        
        if ($result) {
            sendResponse(true, 'Service type created successfully', ['id' => $db->lastInsertId()]);
        } else {
            sendResponse(false, 'Failed to create service type', null, 500);
        }
        
    } elseif ($type === 'categories') {
        $service_type_id = $input['service_type_id'] ?? 0;
        $name = $input['name'] ?? '';
        $display_name = $input['display_name'] ?? '';
        $icon = $input['icon'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        
        if (!$service_type_id || !$name || !$display_name) {
            sendResponse(false, 'Service type ID, name, and display name are required', null, 400);
        }
        
        $sql = "INSERT INTO categories (service_type_id, name, display_name, icon, sort_order) 
                VALUES (:service_type_id, :name, :display_name, :icon, :sort_order)";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':service_type_id' => $service_type_id,
            ':name' => $name,
            ':display_name' => $display_name,
            ':icon' => $icon,
            ':sort_order' => $sort_order
        ]);
        
        if ($result) {
            sendResponse(true, 'Category created successfully', ['id' => $db->lastInsertId()]);
        } else {
            sendResponse(false, 'Failed to create category', null, 500);
        }
        
    } elseif ($type === 'sub-categories') {
        $category_id = $input['category_id'] ?? 0;
        $name = $input['name'] ?? '';
        $display_name = $input['display_name'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        
        if (!$category_id || !$name || !$display_name) {
            sendResponse(false, 'Category ID, name, and display name are required', null, 400);
        }
        
        $sql = "INSERT INTO sub_categories (category_id, name, display_name, sort_order) 
                VALUES (:category_id, :name, :display_name, :sort_order)";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':category_id' => $category_id,
            ':name' => $name,
            ':display_name' => $display_name,
            ':sort_order' => $sort_order
        ]);
        
        if ($result) {
            sendResponse(true, 'Sub-category created successfully', ['id' => $db->lastInsertId()]);
        } else {
            sendResponse(false, 'Failed to create sub-category', null, 500);
        }
    }
    
} elseif ($method === 'PUT') {
    // Only super admin can manage picklists
    if ($admin['role'] !== 'super_admin') {
        sendResponse(false, 'Access denied', null, 403);
    }
    
    if ($type === 'service-types' && $id) {
        $display_name = $input['display_name'] ?? '';
        $icon = $input['icon'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        $is_active = $input['is_active'] ?? true;
        
        $sql = "UPDATE service_types SET display_name = :display_name, icon = :icon, sort_order = :sort_order, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':display_name' => $display_name,
            ':icon' => $icon,
            ':sort_order' => $sort_order,
            ':is_active' => $is_active,
            ':id' => $id
        ]);
        
        sendResponse($result, $result ? 'Updated successfully' : 'Update failed');
        
    } elseif ($type === 'categories' && $id) {
        $display_name = $input['display_name'] ?? '';
        $icon = $input['icon'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        $is_active = $input['is_active'] ?? true;
        
        $sql = "UPDATE categories SET display_name = :display_name, icon = :icon, sort_order = :sort_order, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':display_name' => $display_name,
            ':icon' => $icon,
            ':sort_order' => $sort_order,
            ':is_active' => $is_active,
            ':id' => $id
        ]);
        
        sendResponse($result, $result ? 'Updated successfully' : 'Update failed');
        
    } elseif ($type === 'sub-categories' && $id) {
        $display_name = $input['display_name'] ?? '';
        $sort_order = $input['sort_order'] ?? 0;
        $is_active = $input['is_active'] ?? true;
        
        $sql = "UPDATE sub_categories SET display_name = :display_name, sort_order = :sort_order, is_active = :is_active WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':display_name' => $display_name,
            ':sort_order' => $sort_order,
            ':is_active' => $is_active,
            ':id' => $id
        ]);
        
        sendResponse($result, $result ? 'Updated successfully' : 'Update failed');
    }
    
} elseif ($method === 'DELETE') {
    // Only super admin can manage picklists
    if ($admin['role'] !== 'super_admin') {
        sendResponse(false, 'Access denied', null, 403);
    }
    
    if ($type === 'service-types' && $id) {
        $sql = "DELETE FROM service_types WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':id' => $id]);
        sendResponse($result, $result ? 'Deleted successfully' : 'Delete failed');
        
    } elseif ($type === 'categories' && $id) {
        $sql = "DELETE FROM categories WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':id' => $id]);
        sendResponse($result, $result ? 'Deleted successfully' : 'Delete failed');
        
    } elseif ($type === 'sub-categories' && $id) {
        $sql = "DELETE FROM sub_categories WHERE id = :id";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([':id' => $id]);
        sendResponse($result, $result ? 'Deleted successfully' : 'Delete failed');
    }
}
?>