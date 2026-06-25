<?php
require_once '../../../config/database.php';

function verifyAdminToken() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    
    if (empty($token)) {
        sendResponse(false, 'Unauthorized', null, 401);
    }
    
    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $token);
    
    // Decode token
    $decoded = json_decode(base64_decode($token), true);
    
    if (!$decoded || !isset($decoded['expires']) || $decoded['expires'] < time()) {
        sendResponse(false, 'Token expired or invalid', null, 401);
    }
    
    return $decoded;
}
?>