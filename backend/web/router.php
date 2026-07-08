<?php

$path = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// Если запрашивается реальный существующий файл (css/js/img) — отдаём его как есть
if ($path !== '/' && file_exists(__DIR__ . $path)) {
    return false;
}

// Иначе всё уходит в index.php (стандартный front controller)
require_once __DIR__ . '/index.php';

