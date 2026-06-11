<?php
require_once '../../../config/database.php';

// Note: This endpoint doesn't actually need database connection for file upload
// But keeping it for consistency

header("Content-Type: application/json");

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
$upload_path = '../../uploads/products/' . $filename;

// Create directory if not exists
if (!file_exists('../../uploads/products')) {
    mkdir('../../uploads/products', 0777, true);
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    $image_url = '/uploads/products/' . $filename;
    sendResponse(true, 'Image uploaded successfully', ['image_url' => $image_url]);
} else {
    sendResponse(false, 'Failed to upload image', null, 500);
}
?>