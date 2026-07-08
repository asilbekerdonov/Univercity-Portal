<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

class User extends ActiveRecord implements IdentityInterface
{
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_SUPERVISOR = 'supervisor';
    const ROLE_WORKER = 'worker';

    const STATUS_ACTIVE = 'active';
    const STATUS_BLOCKED = 'blocked';

    public static function tableName()
    {
        return '{{%users}}';
    }

    public function behaviors()
    {
        return [TimestampBehavior::class];
    }

    public static function roleList(): array
    {
        return [
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_SUPERVISOR => 'Supervisor',
            self::ROLE_WORKER => 'Worker',
        ];
    }

    public static function statusList(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_BLOCKED => 'Blocked',
        ];
    }

    public function rules()
    {
        return [
            [['name', 'email', 'password_hash', 'role', 'status', 'auth_key'], 'required'],
            [['name', 'email'], 'string', 'max' => 255],
            ['email', 'email'],
            ['email', 'unique'],
            ['phone', 'string', 'max' => 20],
            ['role', 'in', 'range' => array_keys(self::roleList())],
            ['status', 'in', 'range' => array_keys(self::statusList())],
            ['created_by', 'integer'],
        ];
    }

    public function setPassword(string $password): void
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    public function validatePassword(string $password): bool
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    public function generateAuthKey(): void
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => self::STATUS_ACTIVE]);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        $payload = Yii::$app->jwt->validate($token);
        if (!$payload) {
            return null;
        }
        return static::findIdentity($payload['sub']);
    }

    public static function findByEmail(string $email): ?self
    {
        return static::findOne(['email' => $email]);
    }

    public function getId()
    {
        return $this->id;
    }

    public function getAuthKey()
    {
        return $this->auth_key;
    }

    public function validateAuthKey($authKey)
    {
        return $this->auth_key === $authKey;
    }
}