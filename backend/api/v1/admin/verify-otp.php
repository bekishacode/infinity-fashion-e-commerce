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
$otp = $input['otp'] ?? '';

if (empty($email) || empty($otp)) {
    sendResponse(false, 'Email and OTP are required', null, 400);
}

// Get admin by email
$sql = "SELECT id FROM admin_users WHERE email = :email AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Invalid email or OTP', null, 400);
}

// Verify OTP
$otpSql = "SELECT id FROM admin_password_resets 
           WHERE admin_id = :admin_id AND otp = :otp AND used = 0 AND expires_at > NOW()";
$otpStmt = $db->prepare($otpSql);
$otpStmt->execute([':admin_id' => $admin['id'], ':otp' => $otp]);
$reset = $otpStmt->fetch(PDO::FETCH_ASSOC);

if (!$reset) {
    sendResponse(false, 'Invalid or expired OTP', null, 400);
}

// Mark OTP as used
$updateSql = "UPDATE admin_password_resets SET used = 1 WHERE id = :id";
$updateStmt = $db->prepare($updateSql);
$updateStmt->execute([':id' => $reset['id']]);

// Generate reset token
$resetToken = bin2hex(random_bytes(32));
sendResponse(true, 'OTP verified successfully', ['reset_token' => $resetToken]);
?>