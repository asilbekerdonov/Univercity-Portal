<?php

use yii\db\Migration;

class m260711_072542_seed_faculties extends Migration
{
    public function safeUp()
    {
        $now = time();

        for ($i = 1; $i <= 12; $i++) {
            $this->insert('{{%faculties}}', [
                'name' => "Faculty {$i}",
                'slug' => "faculty-{$i}",
                'description' => null,
                'sort_order' => $i,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function safeDown()
    {
        $this->delete('{{%faculties}}');
    }
}
