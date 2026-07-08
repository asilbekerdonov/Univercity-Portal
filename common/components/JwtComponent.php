<?php

namespace common\components;

use Firebase\JWT\JWT as FirebaseJWT; // Переименовываем импорт
use Firebase\JWT\Key;
use yii\base\Component;

class JwtComponent extends Component  // Меняем имя класса
{
    public string $secret;
    public int $expire = 86400;
    public string $algo = 'HS256';

    public function generate(int $userId, string $role): string
    {
        $issuedAt = time();
        $payload = [
            'sub' => $userId,
            'role' => $role,
            'iat' => $issuedAt,
            'exp' => $issuedAt + $this->expire,
        ];

        return FirebaseJWT::encode($payload, $this->secret, $this->algo); // Используем переименованный класс
    }

    public function validate(string $token): ?array
    {
        try {
            $decoded = FirebaseJWT::decode($token, new Key($this->secret, $this->algo)); // Используем переименованный класс
            return (array)$decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}