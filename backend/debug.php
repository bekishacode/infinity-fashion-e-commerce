<?php
header('Content-Type: text/plain');
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";
echo "Current Directory: " . __DIR__ . "\n\n";
echo "Directory contents:\n";
echo "==================\n\n";

// List root directory
echo "Root directory (" . __DIR__ . "):\n";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        echo "  - " . $file . (is_dir(__DIR__ . '/' . $file) ? '/' : '') . "\n";
    }
}

// Check if data directory exists
echo "\nChecking for data directory:\n";
if (is_dir(__DIR__ . '/data')) {
    echo "  ✓ data directory exists\n";
    echo "  Contents:\n";
    $dataFiles = scandir(__DIR__ . '/data');
    foreach ($dataFiles as $file) {
        if ($file != '.' && $file != '..') {
            echo "    - " . $file . "\n";
        }
    }
} else {
    echo "  ✗ data directory NOT found at " . __DIR__ . "/data\n";
}

// Check other possible locations
echo "\nChecking alternate locations:\n";
$paths = [
    __DIR__ . '/../data',
    __DIR__ . '/../../data',
    $_SERVER['DOCUMENT_ROOT'] . '/data',
    $_SERVER['DOCUMENT_ROOT'] . '/../data',
];

foreach ($paths as $path) {
    if (is_dir($path)) {
        echo "  ✓ Found data directory at: $path\n";
    } else {
        echo "  ✗ Not found: $path\n";
    }
}
?>