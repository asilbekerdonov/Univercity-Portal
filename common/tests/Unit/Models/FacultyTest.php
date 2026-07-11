<?php

declare(strict_types=1);

namespace common\tests\Unit\Models;

use common\models\Faculty;
use PHPUnit\Framework\TestCase;
use Yii;

/**
 * Простой PHPUnit-тест для создания Faculty.
 *
 * Требует поднятого приложения Yii (bootstrap) и тестовой БД
 * с применёнными миграциями (create_faculties_table + seed_faculties).
 *
 * Запуск (из корня yii/):
 *   vendor/bin/phpunit common/tests/Unit/Models/FacultyTest.php
 */
final class FacultyTest extends TestCase
{
    private const TEST_SLUG = 'test-faculty-creation';

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

    protected function setUp(): void
    {
        parent::setUp();
        Faculty::deleteAll(['slug' => self::TEST_SLUG]);
    }

    protected function tearDown(): void
    {
        Faculty::deleteAll(['slug' => self::TEST_SLUG]);
        parent::tearDown();
    }

    public function testFacultyCanBeCreatedAndPersisted(): void
    {
        $faculty = new Faculty();
        $faculty->name = 'Test Faculty Creation';
        $faculty->slug = self::TEST_SLUG;
        $faculty->sort_order = 999;
        $faculty->is_active = true;

        $saved = $faculty->save();

        $this->assertTrue(
            $saved,
            'Faculty должен сохраниться без ошибок валидации: ' . json_encode($faculty->errors),
        );
        $this->assertNotNull($faculty->id);

        $found = Faculty::findOne(['slug' => self::TEST_SLUG]);
        $this->assertNotNull($found, 'Faculty должен находиться в БД после сохранения');
        $this->assertSame('Test Faculty Creation', $found->name);
        $this->assertSame(999, $found->sort_order);
        $this->assertTrue((bool)$found->is_active);
    }

    public function testFacultyRequiresNameAndSlug(): void
    {
        $faculty = new Faculty();

        $this->assertFalse($faculty->validate());
        $this->assertArrayHasKey('name', $faculty->errors);
        $this->assertArrayHasKey('slug', $faculty->errors);
    }

    public function testFacultySlugMustBeUnique(): void
    {
        $first = new Faculty();
        $first->name = 'Test Faculty Creation';
        $first->slug = self::TEST_SLUG;
        $first->sort_order = 999;
        $first->save(false);

        $second = new Faculty();
        $second->name = 'Another Faculty';
        $second->slug = self::TEST_SLUG;
        $second->sort_order = 1000;

        $this->assertFalse($second->validate());
        $this->assertArrayHasKey('slug', $second->errors);

        // Все проверки прошли — создание факультета действительно работает.
        fwrite(STDERR, "\n✅ Faculty creation working properly\n");
    }
}