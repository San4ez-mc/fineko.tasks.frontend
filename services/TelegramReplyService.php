<?php
namespace Services;

class TelegramReplyService
{
    private string $botToken;

    public function __construct(string $botToken)
    {
        $this->botToken = $botToken;
    }

    /**
     * Send a message through Telegram Bot API.
     *
     * @param int|string $chat_id
     * @param string $text
     * @param int|null $reply_to_message_id
     *
     * @return array Decoded JSON response from Telegram.
     */
    public function sendMessage($chat_id, string $text, ?int $reply_to_message_id = null): array
    {
        $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";
        $params = [
            'chat_id' => $chat_id,
            'text' => $text,
        ];
        if ($reply_to_message_id !== null) {
            $params['reply_to_message_id'] = $reply_to_message_id;
        }

        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($params),
            ],
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        if ($response === false) {
            throw new \RuntimeException('Failed to send message to Telegram');
        }

        return json_decode($response, true);
    }
}
