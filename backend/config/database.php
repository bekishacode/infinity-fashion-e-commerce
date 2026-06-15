<?php
// Only set headers if not running from command line
if (php_sapi_name() !== 'cli') {
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

class Database {
    private $host = "localhost";
    private $db_name = "style_badge";
    private $username = "root";
    private $password = "Jesuspaiditall24!";
    private $conn;

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch(PDOException $e) {
                // Only output JSON if not in CLI mode
                if (php_sapi_name() !== 'cli') {
                    echo json_encode([
                        "success" => false,
                        "message" => "Database connection failed: " . $e->getMessage()
                    ]);
                } else {
                    echo "Database connection failed: " . $e->getMessage() . "\n";
                }
                exit();
            }
        }
        return $this->conn;
    }
}

function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
?>