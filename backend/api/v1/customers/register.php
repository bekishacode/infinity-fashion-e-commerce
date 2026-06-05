<?php
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';
$name = $input['name'] ?? '';
$address = $input['address'] ?? '';

if ((!$email && !$phone) || !$password) {
    sendResponse(false, "Email/phone and password are required", null, 400);
}

// Check if customer exists
$checkSql = "SELECT id FROM customers WHERE email = '$email' OR phone = '$phone'";
$checkResult = $db->query($checkSql);

if ($checkResult->num_rows > 0) {
    sendResponse(false, "Email or phone already registered", null, 409);
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO customers (email, phone, password, name, address) 
        VALUES ('$email', '$phone', '$hashedPassword', '$name', '$address')";

if ($db->query($sql)) {
    sendResponse(true, "Registration successful", ["customer_id" => $db->insert_id]);
} else {
    sendResponse(false, "Registration failed: " . $db->error, null, 500);
}
?>