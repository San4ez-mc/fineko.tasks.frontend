<?php

use yii\db\Migration;

/**
 * Handles the creation or updating of table `{{%telegram_users}}`.
 */
class m20250815_143003_create_telegram_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $schema = $this->db->getTableSchema('{{%telegram_users}}', true);

        if ($schema === null) {
            // reuse telegram_aliases table if present
            if ($this->db->getTableSchema('{{%telegram_aliases}}', true) !== null) {
                $this->renameTable('{{%telegram_aliases}}', '{{%telegram_users}}');
                $schema = $this->db->getTableSchema('{{%telegram_users}}', true);
            }
        }

        if ($schema === null) {
            $this->createTable('{{%telegram_users}}', [
                'id' => $this->primaryKey(),
                'company_id' => $this->integer()->notNull(),
                'employee_id' => $this->integer()->null(),
                'telegram_user_id' => $this->bigInteger()->notNull(),
                'username' => $this->string(255),
                'first_name' => $this->string(255),
                'last_name' => $this->string(255),
                'display_name' => $this->string(255),
                'synonyms' => $this->json(),
                'is_active' => $this->tinyInteger(1)->defaultValue(1),
                'last_seen_at' => $this->dateTime()->null(),
                'created_at' => $this->dateTime()->notNull(),
            ]);
            $this->createIndex('idx-telegram_users-company_user', '{{%telegram_users}}', ['company_id','telegram_user_id'], true);
        } else {
            $columns = $schema->columns;
            if (!isset($columns['company_id'])) {
                $this->addColumn('{{%telegram_users}}', 'company_id', $this->integer()->notNull());
            }
            if (!isset($columns['employee_id'])) {
                $this->addColumn('{{%telegram_users}}', 'employee_id', $this->integer()->null());
            }
            if (!isset($columns['telegram_user_id'])) {
                $this->addColumn('{{%telegram_users}}', 'telegram_user_id', $this->bigInteger()->notNull());
            }
            if (!isset($columns['username'])) {
                $this->addColumn('{{%telegram_users}}', 'username', $this->string(255));
            }
            if (!isset($columns['first_name'])) {
                $this->addColumn('{{%telegram_users}}', 'first_name', $this->string(255));
            }
            if (!isset($columns['last_name'])) {
                $this->addColumn('{{%telegram_users}}', 'last_name', $this->string(255));
            }
            if (!isset($columns['display_name'])) {
                $this->addColumn('{{%telegram_users}}', 'display_name', $this->string(255));
            }
            if (!isset($columns['synonyms'])) {
                $this->addColumn('{{%telegram_users}}', 'synonyms', $this->json());
            }
            if (!isset($columns['is_active'])) {
                $this->addColumn('{{%telegram_users}}', 'is_active', $this->tinyInteger(1)->defaultValue(1));
            }
            if (!isset($columns['last_seen_at'])) {
                $this->addColumn('{{%telegram_users}}', 'last_seen_at', $this->dateTime()->null());
            }
            if (!isset($columns['created_at'])) {
                $this->addColumn('{{%telegram_users}}', 'created_at', $this->dateTime()->notNull());
            }
            try {
                $this->createIndex('idx-telegram_users-company_user', '{{%telegram_users}}', ['company_id','telegram_user_id'], true);
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
        if ($this->db->getTableSchema('{{%telegram_users}}', true) !== null) {
            $this->dropTable('{{%telegram_users}}');
        }
        // cannot restore telegram_aliases table
        return false;
    }
}
