<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%telegram_pending_groups}}`.
 */
class m20250815_143001_create_telegram_pending_groups_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if ($this->db->getTableSchema('{{%telegram_pending_groups}}', true) === null) {
            $this->createTable('{{%telegram_pending_groups}}', [
                'id' => $this->primaryKey(),
                'chat_id' => $this->bigInteger()->notNull()->unique(),
                'title' => $this->string(255)->notNull(),
                'invite_code' => $this->string(16)->notNull()->unique(),
                'expires_at' => $this->dateTime()->notNull(),
                'created_at' => $this->dateTime()->notNull(),
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        if ($this->db->getTableSchema('{{%telegram_pending_groups}}', true) !== null) {
            $this->dropTable('{{%telegram_pending_groups}}');
        }
    }
}
