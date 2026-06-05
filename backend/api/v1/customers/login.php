<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    sendResponse(false, "Username and password are required", null, 400);
}

$sql = "SELECT * FROM customers WHERE email = '$username' OR phone = '$username'";
$result = $db->query($sql);

if ($result->num_rows == 0) {
    sendResponse(false, "Customer not found", null, 404);
}

$customer = $result->fetch_assoc();

if (password_verify($password, $customer['password'])) {
    unset($customer['password']);
    sendResponse(true, "Login successful", $customer);
} else {
    sendResponse(false, "Invalid password", null, 401);
}
?>