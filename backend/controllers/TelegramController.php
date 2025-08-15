<?php
namespace backend\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\BadRequestHttpException;
use yii\web\TooManyRequestsHttpException;
use yii\web\ForbiddenHttpException;
use yii\helpers\Json;
use app\models\TelegramGroups;
use app\models\TelegramPendingGroups;
use app\models\TelegramUsers;
use app\services\TelegramReplyService;

/**
 * Telegram webhook controller.
 */
class TelegramController extends Controller
{
    public $enableCsrfValidation = false;

    public function verbs()
    {
        return [
            'webhook' => ['POST'],
            'pending' => ['GET'],
            'groups' => ['GET'],
            'users' => ['GET'],
        ];
    }

    public function actionPending()
    {
        $items = TelegramPendingGroups::find()->asArray()->all();
        foreach ($items as &$item) {
            if (isset($item['invite_code'])) {
                $item['invite_code'] = substr($item['invite_code'], 0, 4) . str_repeat('*', max(0, strlen($item['invite_code']) - 4));
            }
        }
        return $items;
    }

    public function actionGroups($company_id)
    {
        $this->checkCompanyAccess($company_id);
        return TelegramGroups::find()->where(['company_id' => $company_id])->asArray()->all();
    }

    public function actionUsers($company_id, $q = null)
    {
        $this->checkCompanyAccess($company_id);
        $query = TelegramUsers::find()->where(['company_id' => $company_id]);
        if ($q) {
            $query->andWhere(['or',
                ['like', 'display_name', $q],
                ['like', 'username', $q],
                ['like', 'first_name', $q],
                ['like', 'last_name', $q],
            ]);
        }
        $items = $query->asArray()->all();
        return ['items' => $items];
    }

    protected function checkCompanyAccess($companyId): void
    {
        $identity = Yii::$app->user->identity;
        $companies = $identity->companies ?? [];
        $ids = [];
        foreach ($companies as $c) {
            if (is_array($c)) {
                $ids[] = $c['id'] ?? null;
            } elseif (is_object($c)) {
                $ids[] = $c->id ?? null;
            }
        }
        if (!in_array((int)$companyId, $ids, true)) {
            throw new ForbiddenHttpException('No access to this company');
        }
    }

    public function actionWebhook()
    {
        $ipKey = 'tg_rate_' . Yii::$app->request->userIP;
        $count = Yii::$app->cache->get($ipKey) ?? 0;
        if ($count >= 60) {
            throw new TooManyRequestsHttpException('Rate limit exceeded');
        }
        Yii::$app->cache->set($ipKey, $count + 1, 60);

        $raw = Yii::$app->request->getRawBody();

        try {
            $update = Json::decode($raw, true);
        } catch (\Throwable $e) {
            $this->log($raw, $e->getMessage());
            throw new BadRequestHttpException('Invalid payload');
        }

        try {
            $this->processUpdate($update, $raw);
        } catch (\Throwable $e) {
            $this->log($raw, $e->getMessage());
            Yii::error($e->getMessage(), __METHOD__);
        }

        return ['status' => 'ok'];
    }

    protected function processUpdate(array $update, string $raw): void
    {
        if (isset($update['my_chat_member']) || isset($update['chat_member'])) {
            $change = $update['my_chat_member'] ?? $update['chat_member'];
            $newStatus = $change['new_chat_member']['status'] ?? null;
            if ($newStatus === 'administrator') {
                $this->log($raw, 'Bot promoted to admin');
            }
            return;
        }

        if (!isset($update['message'])) {
            return;
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'] ?? null;
        $chatType = $message['chat']['type'] ?? null;
        $text = $message['text'] ?? '';
        $botAdded = false;

        if (isset($message['new_chat_members'])) {
            $botId = Yii::$app->params['telegramBotId'] ?? null;
            foreach ($message['new_chat_members'] as $member) {
                if ($botId && ($member['id'] ?? null) == $botId) {
                    $botAdded = true;
                    break;
                }
            }
        }

        if ($chatType && ($botAdded || $text === '/start')) {
            $group = TelegramGroups::find()->where(['chat_id' => $chatId, 'is_active' => 1])->one();
            if (!$group) {
                $pending = TelegramPendingGroups::findOne(['chat_id' => $chatId]);
                if (!$pending) {
                    $pending = new TelegramPendingGroups();
                    $pending->chat_id = $chatId;
                }
                $pending->invite_code = Yii::$app->security->generateRandomString(32);
                $pending->expires_at = time() + 7 * 24 * 60 * 60;
                $pending->save();

                TelegramReplyService::sendMessage($chatId, 'Invite code: ' . $pending->invite_code);
            }
            return;
        }

        if (!TelegramGroups::find()->where(['chat_id' => $chatId, 'is_active' => 1])->exists()) {
            return;
        }

        $from = $message['from'] ?? [];
        $userId = $from['id'] ?? null;
        if ($userId) {
            $user = TelegramUsers::findOne(['telegram_id' => $userId]);
            if (!$user) {
                $user = new TelegramUsers();
                $user->telegram_id = $userId;
                $user->username = $from['username'] ?? null;
                $user->first_name = $from['first_name'] ?? null;
                $user->last_name = $from['last_name'] ?? null;
            }
            $user->last_seen_at = date('Y-m-d H:i:s');
            $user->save();
        }
    }

    protected function log(string $payload, string $message): void
    {
        Yii::$app->db->createCommand()->insert('telegram_messages_log', [
            'created_at' => date('Y-m-d H:i:s'),
            'payload' => $payload,
            'message' => $message,
        ])->execute();
    }
}
