<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);
$tracking_id = $data['tracking_id'];

$stmt = $conn->prepare("DELETE FROM issues WHERE tracking_id = ?");
$stmt->bind_param("s", $tracking_id);
$stmt->execute();

echo json_encode(["success" => true]);
?>
