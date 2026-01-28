<?php
include 'db.php';
$sql = "DELETE FROM users WHERE username != 'admin'";
if ($conn->query($sql)) {
  echo json_encode(["success" => true, "message" => "All users deleted"]);
} else {
  echo json_encode(["success" => false, "message" => $conn->error]);
}
?>
