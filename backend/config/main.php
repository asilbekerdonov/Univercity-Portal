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
            ],
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