<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%users}}`.
 */
class m260707_163458_create_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%users}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'email' => $this->string(255)->notNull()->unique(),
            'password_hash' => $this->string(255)->notNull(),
            'phone' => $this->string(20),
            'role' => $this->string(20)->notNull()->defaultValue('worker'),
            'status' => $this->string(20)->notNull()->defaultValue('active'),
            'auth_key' => $this->string(32)->notNull(),
            'created_by' => $this->integer(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-users-created_by',
            '{{%users}}',
            'created_by',
            '{{%users}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-users-created_by', '{{%users}}');
        $this->dropTable('{{%users}}');
    }
}