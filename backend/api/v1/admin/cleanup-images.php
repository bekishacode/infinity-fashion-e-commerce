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

// Scan only - don't delete
if ($method === 'GET' || ($method === 'POST' && $action === 'scan')) {
    // Get all images from database
    $dbSql = "SELECT image_url FROM product_images";
    $dbStmt = $db->prepare($dbSql);
    $dbStmt->execute();
    $dbImages = $dbStmt->fetchAll(PDO::FETCH_COLUMN);
    $dbImageSet = array_flip($dbImages);

    // Scan uploads directory
    $uploadDir = __DIR__ . '/../../uploads/products/';
    $totalFiles = 0;
    $orphanedFiles = [];

    if (is_dir($uploadDir)) {
        $files = scandir($uploadDir);
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $totalFiles++;
            $webPath = '/api/uploads/products/' . $file;
            
            // Check if file exists in database
            if (!isset($dbImageSet[$webPath])) {
                $filePath = $uploadDir . $file;
                $fileSize = filesize($filePath);
                $orphanedFiles[] = [
                    'filename' => $file,
                    'path' => $webPath,
                    'size' => $fileSize,
                    'size_mb' => round($fileSize / 1024 / 1024, 2),
                    'modified' => date('Y-m-d H:i:s', filemtime($filePath))
                ];
            }
        }
    }
    
    $totalOrphaned = count($orphanedFiles);
    $totalSizeMB = array_sum(array_column($orphanedFiles, 'size_mb'));
    
    sendResponse(true, 'Scan completed', [
        'total_files_scanned' => $totalFiles,
        'orphaned_files_count' => $totalOrphaned,
        'orphaned_files_size_mb' => round($totalSizeMB, 2),
        'orphaned_files' => $orphanedFiles,
        'database_images_count' => count($dbImages),
        'has_orphaned_files' => $totalOrphaned > 0
    ]);
}

// Delete orphaned files
elseif ($method === 'DELETE') {
    // Get all images from database
    $dbSql = "SELECT image_url FROM product_images";
    $dbStmt = $db->prepare($dbSql);
    $dbStmt->execute();
    $dbImages = $dbStmt->fetchAll(PDO::FETCH_COLUMN);
    $dbImageSet = array_flip($dbImages);

    // Scan and delete
    $uploadDir = __DIR__ . '/../../uploads/products/';
    $deletedCount = 0;
    $deletedFiles = [];
    $freedSpace = 0;

    if (is_dir($uploadDir)) {
        $files = scandir($uploadDir);
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $webPath = '/api/uploads/products/' . $file;
            
            // Check if file exists in database
            if (!isset($dbImageSet[$webPath])) {
                $filePath = $uploadDir . $file;
                $freedSpace += filesize($filePath);
                if (unlink($filePath)) {
                    $deletedCount++;
                    $deletedFiles[] = $file;
                }
            }
        }
    }
    
    sendResponse(true, 'Cleanup completed', [
        'orphaned_files_deleted' => $deletedCount,
        'deleted_files' => $deletedFiles,
        'freed_space_mb' => round($freedSpace / 1024 / 1024, 2),
        'database_images_count' => count($dbImages)
    ]);
}
?>