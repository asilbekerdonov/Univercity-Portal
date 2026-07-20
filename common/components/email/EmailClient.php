<?php

namespace common\components\email;

use Yii;
use yii\base\Component;

/**
 * Тонкий клиент к Email Service (Go, REST, порт 8081 по умолчанию — см. README).
 *
 * Использование (Yii::$app->emailClient):
 *   Yii::$app->emailClient->send('user@example.com', 'Subject', '<p>Body</p>');
 *   Yii::$app->emailClient->healthCheck();
 *   Yii::$app->emailClient->status(123);
 *
 * Конфигурация (backend/config/main.php -> 'components'):
 *
 *   'emailClient' => [
 *       'class' => common\components\email\EmailClient::class,
 *       'baseUrl' => 'http://localhost:8081',
 *       'timeout' => 5,
 *   ],
 *
 * Использует чистый curl, чтобы не тянуть в проект дополнительную
 * composer-зависимость только ради одного простого REST-клиента.
 */
class EmailClient extends Component
{
    /** @var string Базовый URL Email Service, например http://localhost:8081 */
    public string $baseUrl = 'http://localhost:8080';

    /** @var int Таймаут на весь запрос (сек.) */
    public int $timeout = 5;

    /**
     * GET /health
     *
     * @return array{status: string}
     * @throws EmailServiceException
     */
    public function healthCheck(): array
    {
        return $this->request('GET', '/health');
    }

    /**
     * POST /send
     *
     * @return array{success: bool, message_id: string, status: string}
     * @throws EmailServiceException
     */
    public function send(string $to, string $subject, string $body, bool $isHtml = false): array
    {
        $result = $this->request('POST', '/send', [
            'to' => $to,
            'subject' => $subject,
            'body' => $body,
            'is_html' => $isHtml,
        ]);

        if (empty($result['success'])) {
            throw new EmailServiceException(
                'Email Service returned failure: ' . ($result['error'] ?? 'unknown error')
            );
        }

        return $result;
    }

    /**
     * GET /api/v1/emails/{id} — проверка статуса конкретного письма.
     *
     * @throws EmailServiceException
     */
    public function status(int $id): array
    {
        return $this->request('GET', '/api/v1/emails/' . $id);
    }

    /**
     * @throws EmailServiceException
     */
    private function request(string $method, string $path, ?array $data = null): array
    {
        $url = rtrim($this->baseUrl, '/') . $path;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data ?? []));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            Yii::error("Email Service unreachable ({$method} {$path}): {$curlError}", __METHOD__);
            throw new EmailServiceException("Email Service is unavailable: {$curlError}");
        }

        Yii::info("Email Service {$method} {$path} -> HTTP {$httpCode}", __METHOD__);

        if ($httpCode < 200 || $httpCode >= 300) {
            Yii::error("Email Service HTTP {$httpCode} on {$method} {$path}: {$response}", __METHOD__);
            throw new EmailServiceException("Email Service returned HTTP {$httpCode}");
        }

        $decoded = json_decode((string) $response, true);
        if (!is_array($decoded)) {
            throw new EmailServiceException('Email Service returned invalid JSON response');
        }

        return $decoded;
    }
}