# University Marketing Portal — Backend API

Бэкенд-часть портала для управления факультетами, студентами и email-рассылками университета. REST API на Yii2 (advanced template) с JWT-аутентификацией, ролевой моделью доступа и асинхронной интеграцией с отдельным микросервисом рассылки писем.

Проект реализован как заказная разработка: ниже — не только инструкция по запуску, но и обоснование архитектурных решений, принятых в ходе работы.

## Стек и архитектурные решения

| Область | Решение | Почему |
|---|---|---|
| API-слой | Yii2 REST (`yii\rest\ActiveController` + кастомные контроллеры) | Готовые CRUD-паттерны для типовых сущностей (факультеты, студенты) не мешают писать кастомную логику там, где она нужна (роли, email) |
| Аутентификация | Stateless JWT (`HttpBearerAuth`) | Backend отдаёт чистый REST API для внешнего фронтенда/мобильного клиента — сессии на cookie здесь не подходят |
| Авторизация | Ролевая модель на уровне контроллеров (`super_admin` / `supervisor` / `worker`) | Явная проверка прав в экшенах вместо RBAC-дерева Yii2 — проще читать и тестировать при текущем размере проекта |
| Email-рассылки | Отдельный микросервис на Go ([email_service](https://github.com/asilbekerdonov/email_service)), а не встроенный `yii\mail\Mailer` | Отправка писем — I/O-тяжёлая операция с внешней зависимостью (SMTP). Вынесена в отдельный сервис с собственной очередью (RabbitMQ) и БД, чтобы отправка не блокировала запрос и не роняла Portal при недоступности почтового провайдера |
| Межсервисное взаимодействие | REST поверх HTTP, с планом миграции критичных вызовов на gRPC | На старте — простота и скорость интеграции; gRPC-контракт уже спроектирован для будущего перехода без изменения бизнес-логики |

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

## Ролевая модель доступа

| Роль | Описание |
|---|---|
| `super_admin` | Полный доступ, конфигурация системы, управление факультетами |
| `supervisor` | Управление профилями студентов (расширенные права) |
| `worker` | Создание/редактирование/удаление профилей студентов |

Проверка роли выполняется явно в экшенах контроллеров (см. `FacultyController::checkSuperAdmin()` и аналоги) — решение сознательно выбрано вместо встроенного Yii2 RBAC с деревом разрешений, так как при текущем наборе из трёх ролей и десятка эндпоинтов явная проверка читается быстрее при код-ревью и не требует отдельной миграции для хранения правил.

## API-эндпоинты

| Метод | Роут | Доступ |
|---|---|---|
| POST | `/v1/auth/login` | Публичный |
| GET | `/v1/faculties` | Любой авторизованный |
| POST | `/v1/faculties` | Только `super_admin` |
| PUT | `/v1/faculties/<id>` | Только `super_admin` |
| DELETE | `/v1/faculties/<id>` | Только `super_admin` |
| GET | `/v1/faculties/<id>/students` | Любой авторизованный |
| POST | `/v1/faculties/<id>/students` | Согласно правам `StudentController` |
| DELETE | `/v1/students/<id>` | Согласно правам `StudentController` |
| GET | `/v1/email/health` | Публичный |
| POST | `/v1/email/send` | Публичный* |
| GET | `/v1/email/status/<id>` | Публичный* |

\* см. раздел «Известные ограничения» ниже — для продакшена эти три роута нужно закрыть аутентификацией.

## Интеграция с Email Service

Один из ключевых архитектурных вопросов проекта: как отправлять письма (уведомления о зачислении, рассылки факультетам), не завязывая Portal напрямую на SMTP и не блокируя HTTP-запрос на время отправки.

Решение — вынести отправку в отдельный микросервис на Go ([email_service](https://github.com/asilbekerdonov/email_service)), общающийся с Portal по REST, с собственной очередью и БД.

### Поток данных

```
Backend (Yii2)                      Email Service (Go)
POST /v1/email/send   ──HTTP──▶     POST /send
                                        │
                                        ├─▶ MySQL (запись письма, статус)
                                        └─▶ RabbitMQ (очередь)
                                               │
                                          Worker ──▶ SMTP (реальная отправка)
```

Запрос к Portal возвращает `{"success":true,"message_id":"...","status":"queued"}` сразу, до реальной отправки — сама отправка асинхронная, через воркер Email Service, читающий очередь RabbitMQ. Это значит, что временная недоступность SMTP-провайдера не приводит к таймауту или ошибке на стороне Portal — письмо просто ждёт своей очереди.

### Настройка

1. Поднимите Email Service отдельно (см. его README) — по умолчанию его HTTP API слушает `:8081` (сознательно не `:8080`, чтобы не конфликтовать с портом самого Portal при локальной разработке).
2. Укажите адрес сервиса через переменную окружения:

```bash
export EMAIL_SERVICE_URL=http://localhost:8081
```

(или отредактируйте дефолт в `backend/config/main.php` -> `emailClient`)

3. Компонент `emailClient` (`common\components\email\EmailClient`) реализован на встроенном `curl`, без дополнительных composer-зависимостей — сознательный выбор в пользу минимальной поверхности для поддержки, раз клиент делает буквально три HTTP-вызова.

### Проверка

```bash
# Health check Email Service через Portal
curl http://localhost:8080/v1/email/health

# Отправка письма
curl -X POST http://localhost:8080/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Hello"}'

# Статус конкретного письма по ID
curl http://localhost:8080/v1/email/status/1
```

## Тесты

```bash
vendor/bin/phpunit common/tests/Unit/Models
```

## Известные ограничения и планы развития

Честно фиксирую, что осталось за рамками текущей итерации — как ориентир для дальнейшей работы:

- **Аутентификация `/v1/email/*`.** Сейчас эти три роута публичные — для продакшена нужно добавить `HttpBearerAuth` в `EmailController::behaviors()` по аналогии с `FacultyController`, чтобы отправку писем нельзя было инициировать анонимно.
- **Идемпотентность отправки.** При ретраях на сетевом уровне (таймаут между Portal и Email Service) возможна повторная постановка одного письма в очередь. Решение — idempotency-key на стороне Email Service, спроектировано, но не реализовано в этой итерации.
- **gRPC вместо REST для межсервисного вызова.** Контракт (`email.proto`) спроектирован заранее, чтобы переход не потребовал переписывания бизнес-логики — сейчас использован REST как более быстрый путь для MVP.
- **Секреты в конфигах.** `jwt.secret` в `backend/config/main.php` — пример-плейсхолдер; в реальном деплое должен браться из переменных окружения или `main-local.php` (не версионируемого), как и указано в шаге 5 установки.

## Частые проблемы

- **`Access denied for user 'root'@'localhost'`** — проверьте пароль в `main-local.php`, для MAMP по умолчанию пароль пустой.
- **`Connection refused`** — убедитесь, что MySQL-сервер (MAMP) запущен, и порт в DSN совпадает с реальным портом сервера.
- **404 на все API-роуты** — убедитесь, что сервер запущен именно через `router.php` (встроенный PHP-сервер не поддерживает mod_rewrite напрямую).
- **`Failed to send email: Email Service is unavailable`** — Email Service не запущен или слушает не тот порт, что указан в `EMAIL_SERVICE_URL`. Проверьте `curl http://localhost:8081/health` напрямую, в обход Portal.