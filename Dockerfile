FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql \
    && printf '%s\n' 'DirectoryIndex index.php index.html' > /etc/apache2/conf-available/directory-index.conf \
    && a2enconf directory-index

WORKDIR /var/www/html
