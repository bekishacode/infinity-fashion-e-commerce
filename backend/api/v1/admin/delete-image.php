<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$image_url = $input['image_url'] ?? '';

if (empty($image_url)) {
    sendResponse(false, 'Image URL is required', null, 400);
}

// Construct file path
$file_path = __DIR__ . '/../../..' . $image_url;

if (file_exists($file_path)) {
    if (unlink($file_path)) {
        sendResponse(true, 'Image file deleted successfully');
    } else {
        sendResponse(false, 'Failed to delete image file', null, 500);
    }
} else {
    // File doesn't exist, still return success
    sendResponse(true, 'Image file not found (already deleted)');
}
?>