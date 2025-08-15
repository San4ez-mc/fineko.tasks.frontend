<?php
require_once __DIR__ . '/../../services/InviteCodeService.php';
require_once __DIR__ . '/../../services/TelegramReplyService.php';

use Services\InviteCodeService;
use Services\TelegramReplyService;

$botToken = getenv('TELEGRAM_BOT_TOKEN');
if (!$botToken) {
    http_response_code(500);
    echo 'Missing TELEGRAM_BOT_TOKEN';
    exit;
}

$raw = file_get_contents('php://input');
$update = json_decode($raw, true);
if (!$update) {
    http_response_code(400);
    echo 'Invalid JSON';
    exit;
}

$replyService = new TelegramReplyService($botToken);
$inviteService = new InviteCodeService();

if (isset($update['message'])) {
    $message = $update['message'];
    $chatId = $message['chat']['id'];
    $text = $message['text'] ?? '';

    if (preg_match('/^\/invite$/i', $text)) {
        $code = $inviteService->generate();
        $replyService->sendMessage($chatId, "Your invite code: $code", $message['message_id']);
    }
}
