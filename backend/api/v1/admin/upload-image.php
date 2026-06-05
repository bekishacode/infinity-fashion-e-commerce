<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No image file uploaded', null, 400);
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$file_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($file_type, $allowed_types)) {
    sendResponse(false, 'Invalid file type. Allowed: JPG, PNG, WEBP', null, 400);
}

// Validate file size
if ($file['size'] > $max_size) {
    sendResponse(false, 'File too large. Max size: 5MB', null, 400);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $extension;

// Correct path: from backend/api/v1/admin/ to backend/api/uploads/products/
$upload_dir = __DIR__ . '/../../uploads/products/';
$upload_path = $upload_dir . $filename;
$web_path = '/api/uploads/products/' . $filename;

// Create directory if not exists
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    sendResponse(true, 'Image uploaded successfully', ['image_url' => $web_path]);
} else {
    $error = error_get_last();
    sendResponse(false, 'Failed to upload image: ' . ($error['message'] ?? 'Unknown error'), null, 500);
}
?>