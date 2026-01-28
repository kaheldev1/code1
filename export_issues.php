<?php
require 'db.php';
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="issues.csv"');

$output = fopen('php://output', 'w');

fputcsv($output, ['Tracking ID', 'User', 'Title', 'Description', 'Category', 'Status', 'Created At']);

$result = $conn->query("SELECT tracking_id, user, title, description, category, status, created_at FROM issues ORDER BY created_at DESC");

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, $row);
    }
}

fclose($output);
exit;
?>
