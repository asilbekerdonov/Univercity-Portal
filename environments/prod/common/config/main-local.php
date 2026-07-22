<?php

return [
    'container' => [
        'singletons' => [
            \yii\mail\MailerInterface::class => [
                'class' => \yii\symfonymailer\Mailer::class,
                'viewPath' => '@common/mail',
            ],
        ],
    ],
    'components' => [
        'db' => [
            'class' => \yii\db\Connection::class,
            'dsn' => getenv('DB_DSN') ?: 'pgsql:host=postgres;port=5432;dbname=yii2advanced',
            'username' => getenv('DB_USERNAME') ?: 'yii2advanced',
            'password' => getenv('DB_PASSWORD') ?: 'secret',
            'charset' => 'utf8',
        ],
        'mailer' => \yii\mail\MailerInterface::class,
    ],
];
