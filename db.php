<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "feedback_portal";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
  die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}
?>
