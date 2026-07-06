<?php
header('Content-Type: application/json');

// Honeypot check
if (!empty($_POST['website'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка отправки'
    ]);
    exit;
}

// Required fields validation
$phone = $_POST['phone'] ?? '';
$email = $_POST['email'] ?? '';
$name = $_POST['name'] ?? '';
$agreement = $_POST['agreement'] ?? '';

if (empty($phone) || empty($email) || empty($name) || empty($agreement)) {
    echo json_encode([
        'success' => false,
        'message' => 'Пожалуйста, заполните все обязательные поля'
    ]);
    exit;
}

// Sanitize inputs
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

$token = "8797967202:AAFmlxanXVizozSf9obwyhgwnuN7qvBvnjk";
$chat_id = "-1003951921217";

$txt = "<b>📩 Новая заявка с сайта</b>\n\n";
$txt .= "<b>Имя:</b> {$name}\n";
$txt .= "<b>Телефон:</b> {$phone}\n";
$txt .= "<b>Email:</b> {$email}\n";
$txt .= "<b>Время:</b> " . date('d.m.Y H:i:s');

$url = "https://api.telegram.org/bot{$token}/sendMessage";

$data = [
    'chat_id' => $chat_id,
    'parse_mode' => 'HTML',
    'text' => $txt
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($data),
        'timeout' => 10
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response !== false) {
    $result = json_decode($response, true);
    
    if ($result && isset($result['ok']) && $result['ok']) {
        echo json_encode([
            'success' => true,
            'message' => 'Ваша заявка успешно отправлена! Мы скоро свяжемся с вами.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка отправки формы. Пожалуйста, попробуйте позже.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка соединения. Проверьте интернет.'
    ]);
}
?>