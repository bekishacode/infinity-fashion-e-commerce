<?php
date_default_timezone_set('Africa/Addis_Ababa');

require_once '../../../config/database.php';
require_once '../../../helpers/EmailHelper.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

// Rate Limit Configuration
define('MAX_REQUESTS_PER_HOUR', 6);        // Max 6 requests per hour
define('MIN_SECONDS_BETWEEN_REQUESTS', 30); // Minimum 30 seconds between requests

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (empty($email)) {
    sendResponse(false, 'Email is required', null, 400);
}

// Check if admin exists
$sql = "SELECT id, email, full_name FROM admin_users WHERE email = :email AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    // For security, don't reveal that email doesn't exist
    sendResponse(true, 'If your email is registered, you will receive an OTP', null, 200);
}

// =============================================
// RATE LIMITING CHECK
// =============================================

// Check recent requests within last hour
$checkRateSql = "SELECT request_count, first_request_at, last_request_at 
                 FROM admin_password_resets 
                 WHERE admin_id = :admin_id 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                 ORDER BY created_at DESC LIMIT 1";
$checkStmt = $db->prepare($checkRateSql);
$checkStmt->execute([':admin_id' => $admin['id']]);
$recent = $checkStmt->fetch(PDO::FETCH_ASSOC);

if ($recent) {
    $requestCount = $recent['request_count'];
    $lastRequest = strtotime($recent['last_request_at']);
    $now = time();
    $secondsSinceLastRequest = $now - $lastRequest;
    
    // Check hourly limit
    if ($requestCount >= MAX_REQUESTS_PER_HOUR) {
        $minutesToWait = 60 - (int)(($now - strtotime($recent['first_request_at'])) / 60);
        sendResponse(false, "Too many attempts. You have reached the limit of " . MAX_REQUESTS_PER_HOUR . " requests per hour. Please try again after {$minutesToWait} minutes.", null, 429);
    }
    
    // Check time between requests
    if ($secondsSinceLastRequest < MIN_SECONDS_BETWEEN_REQUESTS) {
        $waitTime = MIN_SECONDS_BETWEEN_REQUESTS - $secondsSinceLastRequest;
        sendResponse(false, "Please wait {$waitTime} seconds before requesting another OTP.", null, 429);
    }
}

// Generate 6-digit OTP
$otp = sprintf("%06d", mt_rand(1, 999999));
$expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// Check if existing OTP exists (not used, not expired)
$existingSql = "SELECT id, request_count FROM admin_password_resets 
                WHERE admin_id = :admin_id AND used = 0 AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1";
$existingStmt = $db->prepare($existingSql);
$existingStmt->execute([':admin_id' => $admin['id']]);
$existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

if ($existing) {
    // Update existing OTP
    $newCount = $existing['request_count'] + 1;
    $updateSql = "UPDATE admin_password_resets 
                  SET otp = :otp, 
                      expires_at = :expires_at, 
                      request_count = :request_count,
                      last_request_at = NOW(),
                      used = 0
                  WHERE id = :id";
    $updateStmt = $db->prepare($updateSql);
    $updateStmt->execute([
        ':otp' => $otp,
        ':expires_at' => $expires_at,
        ':request_count' => $newCount,
        ':id' => $existing['id']
    ]);
} else {
    // Insert new OTP
    $insertSql = "INSERT INTO admin_password_resets (admin_id, otp, expires_at, request_count, first_request_at, last_request_at) 
                  VALUES (:admin_id, :otp, :expires_at, 1, NOW(), NOW())";
    $insertStmt = $db->prepare($insertSql);
    $insertStmt->execute([
        ':admin_id' => $admin['id'],
        ':otp' => $otp,
        ':expires_at' => $expires_at
    ]);
}

// Send email with OTP
try {
    $emailHelper = new EmailHelper($db);
    $result = $emailHelper->sendEmail($email, 'otp_verification', [
        'name' => $admin['full_name'] ?? 'Admin',
        'otp' => $otp,
        'expires_in' => '15 minutes'
    ]);
    
    if ($result['success']) {
        sendResponse(true, 'OTP sent to your email', null, 200);
    } else {
        sendResponse(false, 'Failed to send OTP. Please try again.', null, 500);
    }
} catch (Exception $e) {
    sendResponse(false, 'Email service error. Please contact support.', null, 500);
}
?>