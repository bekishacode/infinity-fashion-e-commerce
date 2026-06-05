<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "localhost";
    private $db_name = "style_badge";
    private $username = "root";
    private $password = "Jesuspaiditall24!";
    public $conn;

    public function getConnection() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
        
        if ($this->conn->connect_error) {
            die(json_encode([
                "success" => false,
                "message" => "Database connection failed: " . $this->conn->connect_error
            ]));
        }
        
        $this->conn->set_charset("utf8");
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