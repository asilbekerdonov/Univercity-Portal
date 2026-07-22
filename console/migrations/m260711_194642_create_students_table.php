<?php

use yii\db\Migration;

class m260711_194642_create_students_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%students}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'age' => $this->integer()->notNull(),
            'course' => $this->integer()->notNull(),
            'faculty_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex('idx-students-faculty_id', '{{%students}}', 'faculty_id');

        $this->addForeignKey(
            'fk-students-faculty_id',
            '{{%students}}',
            'faculty_id',
            '{{%faculties}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-students-faculty_id', '{{%students}}');
        $this->dropTable('{{%students}}');
    }
}