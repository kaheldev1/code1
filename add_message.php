<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

$tracking_id = $data['tracking_id'];
$sender = $data['sender'];
$text = $data['text'];

$stmt = $conn->prepare("INSERT INTO messages (issue_tracking_id, sender, text, timestamp) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("sss", $tracking_id, $sender, $text);
$stmt->execute();

echo json_encode(["success" => true]);
?>
