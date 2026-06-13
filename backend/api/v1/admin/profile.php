<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method !== 'PUT') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$full_name = $input['full_name'] ?? '';
$current_password = $input['current_password'] ?? '';
$new_password = $input['new_password'] ?? '';

// Update full name
$updateFields = [];
$params = [':id' => $admin['id']];

if ($full_name) {
    $updateFields[] = "full_name = :full_name";
    $params[':full_name'] = $full_name;
}

// Update password if provided
if ($new_password) {
    if (empty($current_password)) {
        sendResponse(false, 'Current password is required to change password', null, 400);
    }
    
    // Verify current password
    $checkSql = "SELECT password FROM admin_users WHERE id = :id";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute([':id' => $admin['id']]);
    $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($current_password, $user['password'])) {
        sendResponse(false, 'Current password is incorrect', null, 400);
    }
    
    if (strlen($new_password) < 6) {
        sendResponse(false, 'New password must be at least 6 characters', null, 400);
    }
    
    $hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);
    $updateFields[] = "password = :password";
    $params[':password'] = $hashedPassword;
}

if (empty($updateFields)) {
    sendResponse(false, 'No fields to update', null, 400);
}

$sql = "UPDATE admin_users SET " . implode(", ", $updateFields) . " WHERE id = :id";
$stmt = $db->prepare($sql);

if ($stmt->execute($params)) {
    // Get updated admin info
    $getSql = "SELECT id, username, email, full_name, role, profile_image FROM admin_users WHERE id = :id";
    $getStmt = $db->prepare($getSql);
    $getStmt->execute([':id' => $admin['id']]);
    $updatedAdmin = $getStmt->fetch(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Profile updated successfully', $updatedAdmin);
} else {
    sendResponse(false, 'Failed to update profile', null, 500);
}
?>