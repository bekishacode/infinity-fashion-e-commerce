<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in (only super admin)
$admin = verifyAdminToken();
if ($admin['role'] !== 'super_admin') {
    sendResponse(false, 'Access denied. Only super admin can perform cleanup.', null, 403);
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 1;

// Scan only - don't delete
if ($method === 'GET' || ($method === 'POST' && $action === 'scan')) {
    // Count expired OTPs
    $countSql = "SELECT COUNT(*) as expired_count 
                 FROM admin_password_resets 
                 WHERE expires_at < NOW() OR (created_at < DATE_SUB(NOW(), INTERVAL :hours HOUR))";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute([':hours' => $hours]);
    $expiredCount = $countStmt->fetch(PDO::FETCH_ASSOC)['expired_count'];
    
    // Get details of expired OTPs
    $detailsSql = "SELECT id, admin_id, otp, expires_at, created_at, used,
                   TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_old
                   FROM admin_password_resets 
                   WHERE expires_at < NOW() OR (created_at < DATE_SUB(NOW(), INTERVAL :hours HOUR))
                   ORDER BY created_at DESC";
    $detailsStmt = $db->prepare($detailsSql);
    $detailsStmt->execute([':hours' => $hours]);
    $expiredOtps = $detailsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get additional stats
    $statsSql = "SELECT 
                    COUNT(*) as total_otps,
                    SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used_count,
                    SUM(CASE WHEN used = 0 AND expires_at > NOW() THEN 1 ELSE 0 END) as active_count,
                    MIN(created_at) as oldest_otp,
                    MAX(created_at) as newest_otp
                 FROM admin_password_resets";
    $statsStmt = $db->prepare($statsSql);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'OTP scan completed', [
        'expired_count' => $expiredCount,
        'expired_otps' => $expiredOtps,
        'stats' => $stats,
        'has_expired' => $expiredCount > 0,
        'hours_threshold' => $hours
    ]);
}

// Delete expired OTPs
elseif ($method === 'DELETE') {
    // Delete expired OTPs
    $deleteSql = "DELETE FROM admin_password_resets 
                  WHERE expires_at < NOW() OR (created_at < DATE_SUB(NOW(), INTERVAL :hours HOUR))";
    $deleteStmt = $db->prepare($deleteSql);
    $deleteStmt->execute([':hours' => $hours]);
    $deletedCount = $deleteStmt->rowCount();
    
    sendResponse(true, 'OTP cleanup completed', [
        'deleted_count' => $deletedCount,
        'hours_threshold' => $hours
    ]);
}
?>