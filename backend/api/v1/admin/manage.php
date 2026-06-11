<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

// Only super admin can manage other admins
if ($admin['role'] !== 'super_admin') {
    sendResponse(false, 'Access denied. Only super admin can manage admin users.', null, 403);
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $id = $_GET['id'] ?? 0;
    
    if ($id) {
        // Get single admin
        $sql = "SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at 
                FROM admin_users WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(false, 'Admin not found', null, 404);
        }
        
        $adminUser = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse(true, 'Admin retrieved successfully', $adminUser);
        
    } else {
        // List all admins
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        $where = "WHERE 1=1";
        $params = [];
        
        if ($search) {
            $where .= " AND (username LIKE :search OR email LIKE :search OR full_name LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM admin_users $where";
        $countStmt = $db->prepare($countSql);
        foreach ($params as $key => &$val) {
            $countStmt->bindParam($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get admins
        $sql = "SELECT id, username, email, full_name, role, is_active, last_login, created_at 
                FROM admin_users $where 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        $stmt->execute();
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Admins retrieved successfully', [
            'admins' => $admins,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }
    
} elseif ($method === 'POST') {
    // Create new admin
    $username = $input['username'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $full_name = $input['full_name'] ?? '';
    $role = $input['role'] ?? 'admin';
    
    // Validate
    if (!$username || !$email || !$password) {
        sendResponse(false, 'Username, email, and password are required', null, 400);
    }
    
    // Check if username exists
    $checkSql = "SELECT id FROM admin_users WHERE username = :username OR email = :email";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute([':username' => $username, ':email' => $email]);
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Username or email already exists', null, 400);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO admin_users (username, email, password, full_name, role, is_active) 
            VALUES (:username, :email, :password, :full_name, :role, 1)";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password' => $hashedPassword,
        ':full_name' => $full_name,
        ':role' => $role
    ]);
    
    if ($result) {
        sendResponse(true, 'Admin created successfully', ['id' => $db->lastInsertId()]);
    } else {
        sendResponse(false, 'Failed to create admin', null, 500);
    }
    
} elseif ($method === 'PUT') {
    // Update admin
    $id = $_GET['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Admin ID required', null, 400);
    }
    
    // Prevent self-removal of super admin role
    if ($id == $admin['id']) {
        sendResponse(false, 'You cannot modify your own account here. Use profile settings.', null, 400);
    }
    
    $updates = [];
    $params = [':id' => $id];
    
    if (isset($input['full_name'])) {
        $updates[] = "full_name = :full_name";
        $params[':full_name'] = $input['full_name'];
    }
    if (isset($input['role'])) {
        $updates[] = "role = :role";
        $params[':role'] = $input['role'];
    }
    if (isset($input['is_active'])) {
        $updates[] = "is_active = :is_active";
        $params[':is_active'] = $input['is_active'];
    }
    if (isset($input['password']) && !empty($input['password'])) {
        $updates[] = "password = :password";
        $params[':password'] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updates)) {
        sendResponse(false, 'No fields to update', null, 400);
    }
    
    $sql = "UPDATE admin_users SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($params)) {
        sendResponse(true, 'Admin updated successfully');
    } else {
        sendResponse(false, 'Failed to update admin', null, 500);
    }
    
} elseif ($method === 'DELETE') {
    // Delete admin
    $id = $_GET['id'] ?? 0;
    if (!$id) {
        sendResponse(false, 'Admin ID required', null, 400);
    }
    
    // Prevent deleting yourself
    if ($id == $admin['id']) {
        sendResponse(false, 'You cannot delete your own account', null, 400);
    }
    
    $sql = "DELETE FROM admin_users WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute([':id' => $id])) {
        sendResponse(true, 'Admin deleted successfully');
    } else {
        sendResponse(false, 'Failed to delete admin', null, 500);
    }
}
?>