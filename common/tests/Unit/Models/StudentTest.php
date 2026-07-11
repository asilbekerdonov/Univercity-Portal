<?php

declare(strict_types=1);

namespace common\tests\Unit\Models;

use common\models\Faculty;
use common\models\Student;
use PHPUnit\Framework\TestCase;
use Yii;

/**
 * Простой PHPUnit-тест для создания Student.
 *
 * Требует поднятого приложения Yii (bootstrap) и тестовой БД
 * с применёнными миграциями (create_faculties_table + create_students_table).
 *
 * Запуск (из корня yii/):
 *   vendor/bin/phpunit common/tests/Unit/Models/StudentTest.php
 */
final class StudentTest extends TestCase
{
    private const TEST_FACULTY_SLUG = 'test-faculty-for-student-tests';
    private const TEST_STUDENT_NAME = 'Test Student Creation';

    private static ?Faculty $faculty = null;

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

        // Student::faculty_id ссылается на реально существующий Faculty
        // (правило 'exist'), поэтому тестам нужен свой фикстурный факультет.
        Faculty::deleteAll(['slug' => self::TEST_FACULTY_SLUG]);

        $faculty = new Faculty();
        $faculty->name = 'Test Faculty For Student Tests';
        $faculty->slug = self::TEST_FACULTY_SLUG;
        $faculty->sort_order = 999;
        $faculty->is_active = true;
        $faculty->save(false);

        self::$faculty = $faculty;
    }

    public static function tearDownAfterClass(): void
    {
        if (self::$faculty !== null) {
            // ON DELETE CASCADE на faculty_id удалит и всех связанных
            // студентов автоматически.
            self::$faculty->delete();
            self::$faculty = null;
        }
    }

    protected function setUp(): void
    {
        parent::setUp();
        Student::deleteAll(['name' => self::TEST_STUDENT_NAME]);
    }

    protected function tearDown(): void
    {
        Student::deleteAll(['name' => self::TEST_STUDENT_NAME]);
        parent::tearDown();
    }

    public function testStudentCanBeCreatedAndPersisted(): void
    {
        $student = new Student();
        $student->name = self::TEST_STUDENT_NAME;
        $student->age = 20;
        $student->course = 2;
        $student->faculty_id = self::$faculty->id;

        $saved = $student->save();

        $this->assertTrue(
            $saved,
            'Student должен сохраниться без ошибок валидации: ' . json_encode($student->errors),
        );
        $this->assertNotNull($student->id);

        $found = Student::findOne(['name' => self::TEST_STUDENT_NAME]);
        $this->assertNotNull($found, 'Student должен находиться в БД после сохранения');
        $this->assertSame(20, $found->age);
        $this->assertSame(2, $found->course);
        $this->assertSame(self::$faculty->id, $found->faculty_id);
    }

    public function testStudentRequiresNameAgeCourseAndFacultyId(): void
    {
        $student = new Student();

        $this->assertFalse($student->validate());
        $this->assertArrayHasKey('name', $student->errors);
        $this->assertArrayHasKey('age', $student->errors);
        $this->assertArrayHasKey('course', $student->errors);
        $this->assertArrayHasKey('faculty_id', $student->errors);
    }

    public function testStudentFacultyMustExist(): void
    {
        $student = new Student();
        $student->name = self::TEST_STUDENT_NAME;
        $student->age = 20;
        $student->course = 2;
        $student->faculty_id = 999999; // заведомо несуществующий факультет

        $this->assertFalse($student->validate());
        $this->assertArrayHasKey('faculty_id', $student->errors);

        fwrite(STDERR, "\n✅ Student creation working properly\n");
    }
}