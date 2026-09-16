<?php
/**
 * Приём сообщений из формы обратной связи.
 *
 * Хостинг у нас без Node, зато с PHP, поэтому обработчик написан на нём.
 * Данные никуда, кроме почты владельца сайта, не уходят и на диске не
 * сохраняются: чем меньше персональных данных лежит на сервере, тем меньше
 * к нему требований по 152-ФЗ.
 *
 * Адрес получателя лежит в form-config.php рядом — этот файл не хранится в
 * репозитории, потому что в нём личная почта.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply($code, $payload) {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, array('ok' => false, 'error' => 'method'));
}

$configPath = __DIR__ . '/form-config.php';
if (!is_file($configPath)) {
    reply(503, array('ok' => false, 'error' => 'not-configured'));
}
$config = require $configPath;
if (empty($config['to'])) {
    reply(503, array('ok' => false, 'error' => 'not-configured'));
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

// Ловушка для ботов: поле спрятано от людей, поэтому заполнить его может
// только автомат. Отвечаем успехом, чтобы не подсказывать, что распознали.
$trap = isset($data['company']) ? trim((string) $data['company']) : '';
if ($trap !== '') {
    reply(200, array('ok' => true));
}

$name    = isset($data['name']) ? trim((string) $data['name']) : '';
$contact = isset($data['contact']) ? trim((string) $data['contact']) : '';
$message = isset($data['message']) ? trim((string) $data['message']) : '';
$consent = !empty($data['consent']);

if (!$consent) {
    reply(400, array('ok' => false, 'error' => 'consent'));
}
if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    reply(400, array('ok' => false, 'error' => 'name'));
}
if (mb_strlen($contact) < 5 || mb_strlen($contact) > 120) {
    reply(400, array('ok' => false, 'error' => 'contact'));
}
if (mb_strlen($message) < 5 || mb_strlen($message) > 2000) {
    reply(400, array('ok' => false, 'error' => 'message'));
}

// Простое ограничение частоты. Храним не адрес, а его хеш: сам IP нам не нужен.
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$stamp = sys_get_temp_dir() . '/itogo-form-' . sha1($ip);
if (is_file($stamp) && (time() - filemtime($stamp)) < 60) {
    reply(429, array('ok' => false, 'error' => 'too-often'));
}
@touch($stamp);

// Переводы строки в заголовках — классический способ подделать письмо,
// поэтому в тему и Reply-To они попасть не должны.
$clean = str_replace(array("\r", "\n"), ' ', $name);

$subject = '=?UTF-8?B?' . base64_encode('Итого — сообщение с сайта') . '?=';
$body = "Имя: {$name}\n"
      . "Контакт: {$contact}\n"
      . "Согласие на обработку данных: да\n"
      . "-----\n"
      . $message . "\n";

$from = !empty($config['from']) ? $config['from'] : ('no-reply@' . $_SERVER['HTTP_HOST']);
$headers = "From: =?UTF-8?B?" . base64_encode('Итого') . "?= <{$from}>\r\n"
         . "Content-Type: text/plain; charset=utf-8\r\n"
         . "MIME-Version: 1.0\r\n";

if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: =?UTF-8?B?" . base64_encode($clean) . "?= <{$contact}>\r\n";
}

$sent = @mail($config['to'], $subject, $body, $headers);
if (!$sent) {
    reply(502, array('ok' => false, 'error' => 'mail'));
}

reply(200, array('ok' => true));
