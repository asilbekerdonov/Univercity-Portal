<?php

namespace common\models;

use yii\base\Model;

class LoginForm extends Model
{
    public $email;
    public $password;

    private ?User $_user = null;

    public function rules()
    {
        return [
            [['email', 'password'], 'required'],
            ['email', 'email'],
            ['password', 'validatePassword'],
        ];
    }

    public function validatePassword($attribute, $params)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();

            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Неверный email или пароль.');
                return;
            }

            if (!$user->isActive()) {
                $this->addError($attribute, 'Неверный email или пароль.');
            }
        }
    }

    public function getUser(): ?User
    {
        if ($this->_user === null) {
            $this->_user = User::findByEmail($this->email);
        }
        return $this->_user;
    }
}