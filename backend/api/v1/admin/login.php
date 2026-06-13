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

// Query admin user - ADDED profile_image
$sql = "SELECT id, username, email, full_name, password, role, profile_image FROM admin_users 
        WHERE (username = :username OR email = :username) AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([':username' => $username]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Invalid credentials', null, 401);
}

// Verify password
if (!password_verify($password, $admin['password'])) {
    sendResponse(false, 'Invalid credentials', null, 401);
}

// Update last login
$updateSql = "UPDATE admin_users SET last_login = NOW() WHERE id = :id";
$updateStmt = $db->prepare($updateSql);
$updateStmt->execute([':id' => $admin['id']]);

// Create session token
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