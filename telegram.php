<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');


require_once __DIR__ . '/config.php';

// Honeypot 
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Enquiry received']);
    exit;
}


$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$name = trim($_POST['name'] ?? '');
$agreement = $_POST['agreement'] ?? '';

if (empty($phone) || empty($email) || empty($name) || empty($agreement)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please complete all required fields'
    ]);
    exit;
}


$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');


$txt = "📩 <b>New website enquiry</b>\n\n";
$txt .= "👤 <b>Name:</b> {$name}\n";
$txt .= "📞 <b>Phone:</b> {$phone}\n";
$txt .= "✉️ <b>Email:</b> {$email}\n";
$txt .= "🕒 <b>Time:</b> " . date('d.m.Y H:i:s');

$url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";

$data = [
    'chat_id' => TELEGRAM_BOT_CHAT_ID,
    'parse_mode' => 'HTML',
    'text' => $txt
];


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200 && $response !== false) {
    $result = json_decode($response, true);
    
    if ($result && isset($result['ok']) && $result['ok']) {
        echo json_encode([
            'success' => true,
            'message' => 'Your enquiry has been sent. We will be in touch soon.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Unable to send your enquiry. Please try again later.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Unable to connect to the server.'
    ]);
}
?>