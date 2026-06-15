<?php
require_once '../../../config/database.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No image file uploaded', null, 400);
}

$id = $_POST['id'] ?? 0;
if (!$id) {
    sendResponse(false, 'Sub-category ID required', null, 400);
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$max_size = 5 * 1024 * 1024;

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$file_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($file_type, $allowed_types)) {
    sendResponse(false, 'Invalid file type. Allowed: JPG, PNG, WEBP', null, 400);
}

if ($file['size'] > $max_size) {
    sendResponse(false, 'File too large. Max size: 5MB', null, 400);
}

// FIXED: Use sub-categories folder
$upload_dir = '../../../api/uploads/sub-categories/';

if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $extension;
$upload_path = $upload_dir . $filename;

if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    $image_url = '/api/uploads/sub-categories/' . $filename;
    
    $database = new Database();
    $db = $database->getConnection();
    
    $sql = "UPDATE sub_categories SET image_url = :image_url WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':image_url' => $image_url, ':id' => $id]);
    
    sendResponse(true, 'Image uploaded successfully', ['image_url' => $image_url]);
} else {
    sendResponse(false, 'Failed to upload image', null, 500);
}
?>