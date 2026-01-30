<?php
include 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

$tracking_id = $data['tracking_id'];
$user = $data['user'];
$title = $data['title'];
$desc = $data['desc'];
$category = $data['category'];
$barangay = $data['barangay'] ?? null; 
$street = $data['street'] ?? null;

$imageData = $data['image'] ?? null;
$imagePath = null;

if ($imageData) {
    if (preg_match('/^data:(image\/\w+);base64,/', $imageData, $type)) {
        $imageType = $type[1];
        $imageBase64 = substr($imageData, strpos($imageData, ',') + 1);
        $imageBase64 = base64_decode($imageBase64);

        if (strlen($imageBase64) > 5 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "Image too large"]);
            exit;
        }

        $ext = '';
        if ($imageType === 'image/jpeg' || $imageType === 'image/jpg') $ext = '.jpg';
        elseif ($imageType === 'image/png') $ext = '.png';
        elseif ($imageType === 'image/gif') $ext = '.gif';
        else {
            echo json_encode(["success" => false, "message" => "Unsupported image type"]);
            exit;
        }

        $uploadsDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

        $filename = uniqid('img_') . $ext;
        $fullpath = $uploadsDir . $filename;
        file_put_contents($fullpath, $imageBase64);

        $imagePath = 'uploads/' . $filename;
    }
}

$stmt = $conn->prepare("INSERT INTO issues (tracking_id, user, title, description, category, barangay, street, image_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
$stmt->bind_param("ssssssss", $tracking_id, $user, $title, $desc, $category, $barangay, $street, $imagePath);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "tracking_id" => $tracking_id]);
} else {
  echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}
?>
