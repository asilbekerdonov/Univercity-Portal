<?php

declare(strict_types=1);

namespace common\tests\Unit\Models;

use common\models\LoginForm;
use PHPUnit\Framework\TestCase;
use Yii;

/**
 * Простой PHPUnit-тест для LoginForm.
 *
 * Требует поднятого приложения Yii (bootstrap) и реальной БД
 * с уже засеянным пользователем admin@marketing.local / ChangeMe123!
 * (см. миграцию safeUp с созданием Super Admin).
 *
 * Запуск (из корня yii/):
 *   vendor/bin/phpunit backend/tests/unit/models/LoginFormTest.php
 */
final class LoginFormTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        $root = dirname(__DIR__, 4); // корень yii/

        if (!class_exists(\Yii::class)) {
            require_once $root . '/vendor/autoload.php';
            require_once $root . '/vendor/yiisoft/yii2/Yii.php';
        }

        defined('YII_DEBUG') or define('YII_DEBUG', true);
        defined('YII_ENV') or define('YII_ENV', 'test');

        require_once $root . '/common/config/bootstrap.php';
        require_once $root . '/console/config/bootstrap.php';

        $config = \yii\helpers\ArrayHelper::merge(
            require $root . '/common/config/main.php',
            require $root . '/common/config/main-local.php',
            require $root . '/common/config/test.php',
            file_exists($root . '/common/config/test-local.php')
                ? require $root . '/common/config/test-local.php'
                : [],
            require $root . '/console/config/main.php',
            require $root . '/console/config/main-local.php',
            require $root . '/console/config/test.php',
        );

        if (Yii::$app === null) {
            new \yii\console\Application($config);
        }
    }

    public function testLoginWithCorrectCredentials(): void
    {
        $model = new LoginForm();
        $model->email = 'admin@marketing.local';
        $model->password = 'ChangeMe123!';

        $this->assertTrue(
            $model->validate(),
            'Форма должна успешно провалидироваться с верными данными: ' . json_encode($model->errors),
        );

        $user = $model->getUser();
        $this->assertNotNull($user, 'Пользователь должен быть найден по email');
        $this->assertSame('admin@marketing.local', $user->email);
        $this->assertSame('super_admin', $user->role);

        // Все проверки прошли — логин действительно работает.
        fwrite(STDERR, "\n✅ Login System working properly\n");
    }

    public function testLoginWithWrongPassword(): void
    {
        $model = new LoginForm();
        $model->email = 'admin@marketing.local';
        $model->password = 'wrong-password';

        $this->assertFalse(
            $model->validate(),
            'Форма не должна пройти валидацию с неверным паролем',
        );
        $this->assertArrayHasKey('password', $model->errors);
    }

    public function testLoginWithNonExistingUser(): void
    {
        $model = new LoginForm();
        $model->email = 'no-such-user@marketing.local';
        $model->password = 'anything123';

        $this->assertFalse(
            $model->validate(),
            'Форма не должна пройти валидацию для несуществующего email',
        );
        $this->assertArrayHasKey('password', $model->errors);
    }

    public function testEmailIsRequired(): void
    {
        $model = new LoginForm();
        $model->password = 'ChangeMe123!';

        $this->assertFalse($model->validate());
        $this->assertArrayHasKey('email', $model->errors);
    }

    public function testPasswordIsRequired(): void
    {
        $model = new LoginForm();
        $model->email = 'admin@marketing.local';

        $this->assertFalse($model->validate());
        $this->assertArrayHasKey('password', $model->errors);
    }
}