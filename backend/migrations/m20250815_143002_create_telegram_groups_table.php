<?php

use yii\db\Migration;

/**
 * Handles the creation or updating of table `{{%telegram_groups}}`.
 */
class m20250815_143002_create_telegram_groups_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $schema = $this->db->getTableSchema('{{%telegram_groups}}', true);
        if ($schema === null) {
            $this->createTable('{{%telegram_groups}}', [
                'id' => $this->primaryKey(),
                'company_id' => $this->integer()->null(),
                'chat_id' => $this->bigInteger()->notNull()->unique(),
                'title' => $this->string(255)->notNull(),
                'is_active' => $this->tinyInteger(1)->defaultValue(0),
                'linked_at' => $this->dateTime()->null(),
                'created_at' => $this->dateTime()->notNull(),
            ]);
        } else {
            $columns = $schema->columns;
            if (!isset($columns['company_id'])) {
                $this->addColumn('{{%telegram_groups}}', 'company_id', $this->integer()->null());
            }
            if (!isset($columns['chat_id'])) {
                $this->addColumn('{{%telegram_groups}}', 'chat_id', $this->bigInteger()->notNull()->unique());
            }
            if (!isset($columns['title'])) {
                $this->addColumn('{{%telegram_groups}}', 'title', $this->string(255)->notNull());
            }
            if (!isset($columns['is_active'])) {
                $this->addColumn('{{%telegram_groups}}', 'is_active', $this->tinyInteger(1)->defaultValue(0));
            }
            if (!isset($columns['linked_at'])) {
                $this->addColumn('{{%telegram_groups}}', 'linked_at', $this->dateTime()->null());
            }
            if (!isset($columns['created_at'])) {
                $this->addColumn('{{%telegram_groups}}', 'created_at', $this->dateTime()->notNull());
            }
            try {
                $this->createIndex('idx-telegram_groups-chat_id', '{{%telegram_groups}}', 'chat_id', true);
            } catch (\yii\db\Exception $e) {
                // index exists
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        if ($this->db->getTableSchema('{{%telegram_groups}}', true) !== null) {
            $this->dropTable('{{%telegram_groups}}');
        }
    }
}
