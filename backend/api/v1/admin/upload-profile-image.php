<?php
require_once '../../../config/database.php';
require_once 'verify.php';

// Verify admin is logged in
$admin = verifyAdminToken();

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No image file uploaded', null, 400);
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$max_size = 2 * 1024 * 1024; // 2MB for profile images

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$file_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($file_type, $allowed_types)) {
    sendResponse(false, 'Invalid file type. Allowed: JPG, PNG, WEBP', null, 400);
}

// Validate file size
if ($file['size'] > $max_size) {
    sendResponse(false, 'File too large. Max size: 2MB', null, 400);
}

// Generate unique filename for profile image
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'profile_' . $admin['id'] . '_' . time() . '.' . $extension;

// Correct path
$upload_dir = __DIR__ . '/../../uploads/profiles/';
$upload_path = $upload_dir . $filename;
$web_path = '/api/uploads/profiles/' . $filename;

// Create directory if not exists
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Delete old profile image if exists
$sql = "SELECT profile_image FROM admin_users WHERE id = :id";
$stmt = $db->prepare($sql);
$stmt->execute([':id' => $admin['id']]);
$oldImage = $stmt->fetch(PDO::FETCH_ASSOC);

if ($oldImage && $oldImage['profile_image']) {
    $oldFilePath = __DIR__ . '/../../..' . $oldImage['profile_image'];
    if (file_exists($oldFilePath)) {
        unlink($oldFilePath);
    }
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    // Update database
    $updateSql = "UPDATE admin_users SET profile_image = :profile_image WHERE id = :id";
    $updateStmt = $db->prepare($updateSql);
    $result = $updateStmt->execute([
        ':profile_image' => $web_path,
        ':id' => $admin['id']
    ]);
    
    if ($result) {
        // Get updated admin info
        $getSql = "SELECT id, username, email, full_name, role, profile_image FROM admin_users WHERE id = :id";
        $getStmt = $db->prepare($getSql);
        $getStmt->execute([':id' => $admin['id']]);
        $updatedAdmin = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Profile image uploaded successfully', [
            'image_url' => $web_path,
            'admin' => $updatedAdmin
        ]);
    } else {
        sendResponse(false, 'Failed to update database', null, 500);
    }
} else {
    sendResponse(false, 'Failed to upload image', null, 500);
}
?>