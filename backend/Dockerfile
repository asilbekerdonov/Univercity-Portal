FROM yiisoftware/yii2-php:8.4-apache

WORKDIR /app

COPY . /app

# ✅ Добавляем PostgreSQL поддержку
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        unzip \
        git \
    && docker-php-ext-install pdo_pgsql pgsql \
    && a2enmod rewrite headers \
    && printf '<VirtualHost *:80>\n    ServerName localhost\n    DocumentRoot /app/backend/web\n    <Directory /app/backend/web>\n        Options Indexes FollowSymLinks\n        AllowOverride All\n        Require all granted\n    </Directory>\n</VirtualHost>\n' > /etc/apache2/sites-available/000-default.conf \
    && php init --env=Development --overwrite=All \
    && mkdir -p /app/runtime \
               /app/backend/runtime \
               /app/common/runtime \
               /app/console/runtime \
               /app/backend/web/assets \
               /app/frontend/web/assets \
    && chown -R www-data:www-data /app/runtime \
                                 /app/backend/runtime \
                                 /app/common/runtime \
                                 /app/console/runtime \
                                 /app/backend/web/assets \
                                 /app/frontend/web/assets

EXPOSE 80

CMD ["/bin/sh", "-c", "cd /app && composer install --no-interaction --prefer-dist && until php -r 'new PDO(getenv(\"DB_DSN\"), getenv(\"DB_USERNAME\"), getenv(\"DB_PASSWORD\"));' >/dev/null 2>&1; do echo 'Waiting for PostgreSQL...'; sleep 2; done && php yii migrate --interactive=0 || true && apache2-foreground"]