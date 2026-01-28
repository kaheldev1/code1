<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);
$tracking_id = $data['tracking_id'];
$status = $data['status'];

$stmt = $conn->prepare("UPDATE issues SET status = ? WHERE tracking_id = ?");
$stmt->bind_param("ss", $status, $tracking_id);
$stmt->execute();

echo json_encode(["success" => true]);
?>
