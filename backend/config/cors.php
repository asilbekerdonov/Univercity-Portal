<?php
return [
    'class' => \yii\filters\Cors::class,
    'cors' => [
        'Origin' => [
            'http://localhost:3100',
            'http://localhost:5173',
            'http://127.0.0.1:3100',
            'http://frontend:3000',
        ],
        'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'Access-Control-Request-Headers' => ['*'],
        'Access-Control-Allow-Credentials' => true,
        'Access-Control-Max-Age' => 86400,
    ],
];
