<?php

use yii\db\Migration;
use common\models\Faculty;

/**
 * Seeds a couple of sample students per existing faculty.
 * Uses real faculty ids from the DB (not hardcoded), so it's safe to run
 * regardless of which faculties already exist.
 */
class m260712_020000_seed_students_table extends Migration
{
    private array $namesPool = [
        ['Ivan Petrov', 20],
        ['Anna Sidorova', 21],
        ['Dmitry Kuznetsov', 19],
        ['Elena Volkova', 22],
        ['Sergey Novikov', 23],
        ['Olga Smirnova', 20],
    ];

    public function safeUp()
    {
        $faculties = Faculty::find()->all();

        if (empty($faculties)) {
            echo "No faculties found — skipping student seed.\n";
            return;
        }

        $poolIndex = 0;
        foreach ($faculties as $faculty) {
            for ($i = 0; $i < 2; $i++) {
                [$name, $age] = $this->namesPool[$poolIndex % count($this->namesPool)];
                $poolIndex++;

                $this->insert('{{%students}}', [
                    'name' => $name,
                    'age' => $age,
                    'course' => random_int(1, 4),
                    'faculty_id' => $faculty->id,
                    'created_at' => time(),
                    'updated_at' => time(),
                ]);
            }
        }
    }

    public function safeDown()
    {
        $this->delete('{{%students}}');
    }
}