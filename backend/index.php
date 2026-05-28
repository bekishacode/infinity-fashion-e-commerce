<?php
// Only respond to root path, not API paths
if ($_SERVER['REQUEST_URI'] === '/' || $_SERVER['REQUEST_URI'] === '/index.php') {
    header('Content-Type: application/json');
    echo json_encode(['message' => 'API is running', 'status' => 'ok']);
    exit;
}

// For any other path, return 404 to let the actual file handle it
http_response_code(404);
echo "File not found";
?>