<?php
require_once 'config/database.php';
require_once 'helpers/EmailHelper.php';

$database = new Database();
$db = $database->getConnection();

$emailHelper = new EmailHelper($db);
$result = $emailHelper->sendEmail(
    'bekifikre19@gmail.com',  // Send to your own email to test
    'otp_verification',
    ['name' => 'Test User', 'otp' => '123456', 'expires_in' => '15 minutes']
);

echo "Result: " . ($result['success'] ? "✅ Email sent!" : "❌ Failed: " . $result['message']);
?>