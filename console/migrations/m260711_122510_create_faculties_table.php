<?php

use yii\db\Migration;

class m260711_122510_create_faculties_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%faculties}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'slug' => $this->string(255)->notNull()->unique(),
            'description' => $this->text()->null(),
            'sort_order' => $this->integer()->notNull()->defaultValue(0),
            'is_active' => $this->boolean()->notNull()->defaultValue(true),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

        $this->createIndex('idx-faculties-sort_order', '{{%faculties}}', 'sort_order');
    }

    public function safeDown()
    {
        $this->dropTable('{{%faculties}}');
    }
}
