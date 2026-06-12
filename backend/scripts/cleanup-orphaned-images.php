#!/usr/bin/env php
<?php
// Run from command line: php cleanup-orphaned-images.php

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Starting orphaned images cleanup...\n";

// Get all images from database
$dbSql = "SELECT image_url FROM product_images";
$dbStmt = $db->prepare($dbSql);
$dbStmt->execute();
$dbImages = $dbStmt->fetchAll(PDO::FETCH_COLUMN);

$dbImageSet = array_flip($dbImages);

// Scan uploads directory
$uploadDir = __DIR__ . '/../api/uploads/products/';
$deletedCount = 0;
$totalFiles = 0;

if (is_dir($uploadDir)) {
    $files = scandir($uploadDir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $totalFiles++;
        $filePath = $uploadDir . $file;
        $webPath = '/api/uploads/products/' . $file;
        
        // Check if file exists in database
        if (!isset($dbImageSet[$webPath])) {
            // Orphaned file - delete it
            if (unlink($filePath)) {
                echo "Deleted orphaned: $file\n";
                $deletedCount++;
            } else {
                echo "Failed to delete: $file\n";
            }
        }
    }
}

echo "\n=== Cleanup Complete ===\n";
echo "Total files scanned: $totalFiles\n";
echo "Orphaned files deleted: $deletedCount\n";
echo "Files in database: " . count($dbImages) . "\n";
?>