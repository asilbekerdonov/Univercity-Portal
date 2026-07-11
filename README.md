# Marketing Portal — Backend

Backend на Yii2 (advanced template) + MySQL с JWT-аутентификацией и REST API.

## Требования

- PHP >= 8.1
- Composer
- MySQL (в разработке используется MAMP, порт 8889)

## Установка

### 1. Клонирование и зависимости

```bash
git clone <URL_репозитория> backend
cd backend
composer install
```

### 2. Инициализация окружения

```bash
php init
```

Выберите `0` (Development).

### 3. Настройка подключения к БД

Откройте `common/config/main-local.php` и укажите свои данные:

```php
<?php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=127.0.0.1;port=8889;dbname=Univercity',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8mb4',
        ],
    ],
];
```

Замените `host`, `port`, `username`, `password` под своё окружение. Если используете MAMP — порт MySQL по умолчанию `8889`, а не стандартный `3306`.

### 4. Создайте базу данных

```bash
php -r '$pdo = new PDO("mysql:host=127.0.0.1;port=8889", "root", ""); $pdo->exec("CREATE DATABASE IF NOT EXISTS Univercity");'
```

(подставьте свои host/port/username/password при необходимости)

### 5. JWT-компонент

В `common/config/main.php` должен быть прописан компонент `jwt`:

```php
'components' => [
    'jwt' => [
        'class' => \common\components\JwtComponent::class,
        'secret' => 'ваш-секретный-ключ-минимум-32-символа',
    ],
],
```

**Секрет вынесите в `main-local.php` или переменные окружения в продакшене — не храните реальный секрет в версионируемых файлах.**

### 6. Прогон миграций (создаст таблицы + применит сидеры)

```bash
php yii migrate
```

Это создаст все таблицы (`users`, `faculties` и т.д.) и заполнит:
- супер-администратора (`admin@marketing.local` / `ChangeMe123!` — **смените пароль после первого входа**)
- 12 факультетов-заглушек

### 7. Запуск сервера

Встроенный PHP-сервер не поддерживает pretty URL, поэтому используется router-скрипт:

```bash
php -S localhost:8080 -t backend/web backend/web/router.php
```

Backend будет доступен на `http://localhost:8080`.

## Проверка работы

### Логин

```bash
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketing.local","password":"ChangeMe123!"}'
```

Ответ содержит `access_token` — используйте его в заголовке `Authorization: Bearer <token>` для последующих запросов.

### Получение списка факультетов

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/v1/faculties
```

## Роли пользователей

| Роль | Описание |
|---|---|
| `super_admin` | Полный доступ, конфигурация системы, управление факультетами |
| `supervisor` | Управление профилями студентов (расширенные права) |
| `worker` | Создание/редактирование/удаление профилей студентов |

## Основные API-эндпоинты

| Метод | Роут | Доступ |
|---|---|---|
| POST | `/v1/auth/login` | Публичный |
| GET | `/v1/faculties` | Любой авторизованный |
| POST | `/v1/faculties` | Только `super_admin` |
| PUT | `/v1/faculties/<id>` | Только `super_admin` |
| DELETE | `/v1/faculties/<id>` | Только `super_admin` |

## Тесты

```bash
./vendor/bin/phpunit tests/Feature/LoginTest.php
```

## Частые проблемы

- **`Access denied for user 'root'@'localhost'`** — проверьте пароль в `main-local.php`, для MAMP по умолчанию пароль пустой.
- **`Connection refused`** — убедитесь, что MySQL-сервер (MAMP) запущен, и порт в DSN совпадает с реальным портом сервера.
- **404 на все API-роуты** — убедитесь, что сервер запущен именно через `router.php` (встроенный PHP-сервер не поддерживает mod_rewrite напрямую).