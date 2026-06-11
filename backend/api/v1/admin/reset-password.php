<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$reset_token = $input['reset_token'] ?? '';
$new_password = $input['new_password'] ?? '';

if (empty($email) || empty($reset_token) || empty($new_password)) {
    sendResponse(false, 'Email, reset token, and new password are required', null, 400);
}

if (strlen($new_password) < 6) {
    sendResponse(false, 'Password must be at least 6 characters', null, 400);
}

// Verify reset token (check if there's a used OTP for this admin recently)
$sql = "SELECT a.id FROM admin_users a
        JOIN admin_password_resets r ON a.id = r.admin_id
        WHERE a.email = :email AND r.used = 1 AND r.created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)";
$stmt = $db->prepare($sql);
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Invalid or expired reset request', null, 400);
}

// Update password
$hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);
$updateSql = "UPDATE admin_users SET password = :password WHERE id = :id";
$updateStmt = $db->prepare($updateSql);

if ($updateStmt->execute([':password' => $hashedPassword, ':id' => $admin['id']])) {
    sendResponse(true, 'Password reset successfully. You can now login with your new password.');
} else {
    sendResponse(false, 'Failed to reset password', null, 500);
}
?>