<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);
$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$gender = $conn->real_escape_string($data['gender']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, email, gender, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $gender, $password);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Registration successful!"]);
} else {
  echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}
?>
