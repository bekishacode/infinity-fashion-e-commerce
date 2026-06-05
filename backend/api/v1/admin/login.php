<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    sendResponse(false, 'Username and password required', null, 400);
}

// Query admin user
$sql = "SELECT id, username, email, full_name, password, role FROM admin_users 
        WHERE (username = ? OR email = ?) AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Invalid credentials', null, 401);
}

$admin = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $admin['password'])) {
    sendResponse(false, 'Invalid credentials', null, 401);
}

// Update last login
$updateSql = "UPDATE admin_users SET last_login = NOW() WHERE id = ?";
$updateStmt = $db->prepare($updateSql);
$updateStmt->bind_param("i", $admin['id']);
$updateStmt->execute();

// Create session token (simple token - for production use JWT)
$token = base64_encode(json_encode([
    'id' => $admin['id'],
    'username' => $admin['username'],
    'role' => $admin['role'],
    'expires' => time() + (24 * 60 * 60) // 24 hours
]));

unset($admin['password']); // Remove password from response

sendResponse(true, 'Login successful', [
    'admin' => $admin,
    'token' => $token
]);
?>