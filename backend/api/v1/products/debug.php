<?php
echo "<pre>";
echo "Current directory: " . __DIR__ . "\n\n";

echo "Files in current directory:\n";
$files = scandir(__DIR__);
foreach ($files as $file) {
    echo "  - " . $file . "\n";
}

echo "\n\nChecking if index.php exists in this directory:\n";
if (file_exists(__DIR__ . '/index.php')) {
    echo "  YES - index.php exists\n";
} else {
    echo "  NO - index.php NOT found\n";
}

echo "\n\nChecking parent directories:\n";
$parent = dirname(__DIR__);
echo "Parent directory: " . $parent . "\n";
echo "Files in parent: " . implode(", ", scandir($parent)) . "\n";
?>
