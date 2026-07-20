<?php

$params = array_merge(
    require __DIR__ . '/../../common/config/params.php',
    require __DIR__ . '/../../common/config/params-local.php',
    require __DIR__ . '/params.php',
    require __DIR__ . '/params-local.php'
);

return [
    'id' => 'app-backend',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'backend\controllers',
    'bootstrap' => ['log'],
    'modules' => [
        'v1' => [
            'class' => 'backend\modules\v1\Module',
        ],
    ],
    'components' => [
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                // Swagger маршруты
                'v1/docs' => 'v1/docs/index',
                'v1/docs/json' => 'v1/docs/json',
                
                // API маршруты
                'POST v1/auth/login' => 'v1/auth/login',
                'v1/auth/login' => 'v1/auth/login',

                'GET v1/faculties' => 'v1/faculty/index',
                'GET v1/faculties/<id>' => 'v1/faculty/view',
                'GET v1/faculties/<id>/students' => 'v1/faculty/students',
                'POST v1/faculties/<id>/students' => 'v1/student/create',
                'POST v1/faculties' => 'v1/faculty/create',
                'PUT v1/faculties/<id>' => 'v1/faculty/update',
                
                'DELETE v1/faculties/<id>' => 'v1/faculty/delete',
                'DELETE v1/students/<id>' => 'v1/student/delete',

                // Email Service integration
                'GET v1/email/health' => 'v1/email/health',
                'POST v1/email/send' => 'v1/email/send',
                'GET v1/email/status/<id:\d+>' => 'v1/email/status',
            ],
        ],
        'emailClient' => [
            'class' => 'common\components\email\EmailClient',
            'baseUrl' => getenv('EMAIL_SERVICE_URL') ?: 'http://localhost:8081',
            'timeout' => 5,
        ],
        'request' => [
            'csrfParam' => '_csrf-backend',
            'parsers' => [
                'application/json' => \yii\web\JsonParser::class,
            ],
        ],
        'jwt' => [
            'class' => 'common\components\JwtComponent', 
            'secret' => 'your-super-secret-key-minimum-32-characters-long-here-123!',
        ],
        'user' => [
            'identityClass' => \common\models\User::class,
            'enableAutoLogin' => true,
            'identityCookie' => ['name' => '_identity-backend', 'httpOnly' => true],
        ],
        'session' => [
            'name' => 'advanced-backend',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => \yii\log\FileTarget::class,
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
    ],
    'params' => $params,
];