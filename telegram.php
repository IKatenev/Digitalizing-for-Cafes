<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Файл с токенами
require_once __DIR__ . '/config.php';

// Honeypot 
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Заявка принята']);
    exit;
}

// Данные
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$name = trim($_POST['name'] ?? '');
$agreement = $_POST['agreement'] ?? '';

if (empty($phone) || empty($email) || empty($name) || empty($agreement)) {
    echo json_encode([
        'success' => false,
        'message' => 'Пожалуйста, заполните все обязательные поля'
    ]);
    exit;
}

// Базовая санитизация
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

// Cообщение
$txt = "📩 <b>Новая заявка с сайта</b>\n\n";
$txt .= "👤 <b>Имя:</b> {$name}\n";
$txt .= "📞 <b>Телефон:</b> {$phone}\n";
$txt .= "✉️ <b>Email:</b> {$email}\n";
$txt .= "🕒 <b>Время:</b> " . date('d.m.Y H:i:s');

$url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";

$data = [
    'chat_id' => TELEGRAM_BOT_CHAT_ID,
    'parse_mode' => 'HTML',
    'text' => $txt
];

// Используем cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
// Если на хостинге устаревшие SSL сертификаты, раскомментируйте строку ниже:
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200 && $response !== false) {
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
        'message' => 'Ошибка соединения с сервером.'
    ]);
}
?>