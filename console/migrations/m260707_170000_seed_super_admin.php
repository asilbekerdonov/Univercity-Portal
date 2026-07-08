<?php

use yii\db\Migration;
use common\models\User;

class m260707_170000_seed_super_admin extends Migration
{
    public function safeUp()
    {
        $user = new User();
        $user->name = 'Super Admin';
        $user->email = 'admin@marketing.local';
        $user->role = User::ROLE_SUPER_ADMIN;
        $user->status = User::STATUS_ACTIVE;
        $user->setPassword('ChangeMe123!');
        $user->generateAuthKey();

        if (!$user->save(false)) {
            throw new \Exception('Seed failed: ' . json_encode($user->errors));
        }
    }

    public function safeDown()
    {
        $this->delete('{{%users}}', ['email' => 'admin@marketing.local']);
    }
}