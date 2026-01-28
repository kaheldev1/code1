<?php
include 'db.php';
$user = $_GET['user'] ?? '';

$stmt = $conn->prepare("SELECT * FROM issues WHERE user = ? ORDER BY id DESC");
$stmt->bind_param("s", $user);
$stmt->execute();
$res = $stmt->get_result();

$issues = [];
while ($row = $res->fetch_assoc()) {
  $mstmt = $conn->prepare("SELECT sender, text, timestamp FROM messages WHERE issue_tracking_id = ? ORDER BY timestamp ASC");
  $mstmt->bind_param("s", $row['tracking_id']);
  $mstmt->execute();
  $mres = $mstmt->get_result();
  $row['messages'] = $mres->fetch_all(MYSQLI_ASSOC);
  $issues[] = $row;
}
echo json_encode($issues);
?>
