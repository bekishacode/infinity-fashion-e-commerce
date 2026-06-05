<?php
$host = 'localhost';
$db = 'style_badge';
$user = 'root';
$pass = 'Jesuspaiditall24!';

echo "Testing MySQL connection...<br>";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected successfully to database: $db<br>";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Products count: " . $result['count'] . "<br>";
    
} catch(PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "<br>";
    echo "Error code: " . $e->getCode() . "<br>";
}
?>