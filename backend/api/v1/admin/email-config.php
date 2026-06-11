<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

// Only super admin can manage email config
if ($admin['role'] !== 'super_admin') {
    sendResponse(false, 'Access denied', null, 403);
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    // Get email configuration
    $sql = "SELECT * FROM email_config LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $config = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // If no config exists, create default
    if (!$config) {
        $insertSql = "INSERT INTO email_config (from_email, from_name) VALUES (:from_email, :from_name)";
        $insertStmt = $db->prepare($insertSql);
        $insertStmt->execute([':from_email' => 'noreply@stylebadge.com', ':from_name' => 'Style Badge']);
        
        // Fetch again
        $stmt->execute();
        $config = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Remove sensitive data
    if ($config) {
        unset($config['smtp_password']);
    }
    
    // Get all templates
    $templatesSql = "SELECT id, template_key, name, subject, variables, description, is_active, updated_at 
                     FROM email_templates ORDER BY name";
    $templatesStmt = $db->prepare($templatesSql);
    $templatesStmt->execute();
    $templates = $templatesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Email config retrieved', [
        'config' => $config,
        'templates' => $templates
    ]);
    
} elseif ($method === 'PUT') {
    // Update email configuration
    $provider = $input['provider'] ?? 'smtp';
    $smtp_host = $input['smtp_host'] ?? null;
    $smtp_port = $input['smtp_port'] ?? 587;
    $smtp_username = $input['smtp_username'] ?? null;
    $smtp_password = $input['smtp_password'] ?? null;
    $smtp_encryption = $input['smtp_encryption'] ?? 'tls';
    $from_email = $input['from_email'] ?? '';
    $from_name = $input['from_name'] ?? '';
    
    if (!$from_email || !$from_name) {
        sendResponse(false, 'From email and from name are required', null, 400);
    }
    
    // Check if config exists
    $checkSql = "SELECT id FROM email_config LIMIT 1";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->execute();
    $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        // Update existing
        $sql = "UPDATE email_config SET 
                provider = :provider,
                smtp_host = :smtp_host,
                smtp_port = :smtp_port,
                smtp_username = :smtp_username,
                smtp_encryption = :smtp_encryption,
                from_email = :from_email,
                from_name = :from_name,
                updated_at = NOW()";
        
        $params = [
            ':provider' => $provider,
            ':smtp_host' => $smtp_host,
            ':smtp_port' => $smtp_port,
            ':smtp_username' => $smtp_username,
            ':smtp_encryption' => $smtp_encryption,
            ':from_email' => $from_email,
            ':from_name' => $from_name
        ];
        
        if ($smtp_password && !empty($smtp_password)) {
            $sql .= ", smtp_password = :smtp_password";
            $params[':smtp_password'] = $smtp_password;
        }
        
        $stmt = $db->prepare($sql);
    } else {
        // Insert new
        $sql = "INSERT INTO email_config (provider, smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name) 
                VALUES (:provider, :smtp_host, :smtp_port, :smtp_username, :smtp_password, :smtp_encryption, :from_email, :from_name)";
        
        $params = [
            ':provider' => $provider,
            ':smtp_host' => $smtp_host,
            ':smtp_port' => $smtp_port,
            ':smtp_username' => $smtp_username,
            ':smtp_password' => $smtp_password,
            ':smtp_encryption' => $smtp_encryption,
            ':from_email' => $from_email,
            ':from_name' => $from_name
        ];
        
        $stmt = $db->prepare($sql);
    }
    
    if ($stmt->execute($params)) {
        sendResponse(true, 'Email configuration updated successfully');
    } else {
        $error = $stmt->errorInfo();
        sendResponse(false, 'Failed to update email configuration: ' . $error[2], null, 500);
    }
}
?>