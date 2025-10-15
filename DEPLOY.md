# 🚀 Инструкция по развёртыванию на Timeweb Cloud

## Предварительные требования

- Облачный сервер на Timeweb Cloud с Ubuntu 20.04/22.04
- Доступ по SSH
- Node.js 20+ установлен
- Nginx установлен
- PM2 установлен глобально (`npm install -g pm2`)
- Доменное имя настроено на IP сервера

## Шаг 1: Подготовка директорий

```bash
# Подключение к серверу
ssh user@your-server-ip

# Создание рабочих директорий
sudo mkdir -p /var/www/med-inventory
sudo mkdir -p /var/lib/site2

# Установка прав
sudo chown -R $USER:$USER /var/www/med-inventory
sudo chown -R $USER:$USER /var/lib/site2
```

## Шаг 2: Загрузка проекта

### Вариант А: Через Git

```bash
cd /var/www/med-inventory
git clone <your-repository-url> .
```

### Вариант Б: Через SFTP/SCP

Загрузите все файлы проекта в `/var/www/med-inventory`

## Шаг 3: Установка зависимостей

```bash
# Сервер
cd /var/www/med-inventory/server
npm install --production

# Клиент
cd /var/www/med-inventory/ui
npm install
npm run build
```

## Шаг 4: Настройка переменных окружения

```bash
# Создание .env для сервера
cd /var/www/med-inventory/server
nano .env
```

Содержимое файла:

```env
PORT=3001
DB_FILE=/var/lib/site2/maindb.sqlite
CORS_ORIGIN=https://your-domain.com
ADMIN_LOGIN=admin
ADMIN_PASSWORD=secure_password_here
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X)

## Шаг 5: Инициализация базы данных

```bash
cd /var/www/med-inventory/server
npm run seed
```

Проверьте, что файл БД создан:

```bash
ls -lh /var/lib/site2/maindb.sqlite
```

## Шаг 6: Запуск с PM2

```bash
cd /var/www/med-inventory/server

# Запуск приложения
pm2 start src/index.js --name med-inventory-api

# Проверка статуса
pm2 status

# Просмотр логов
pm2 logs med-inventory-api

# Автозапуск при перезагрузке
pm2 save
pm2 startup
# Выполните команду, которую выдаст pm2 startup
```

## Шаг 7: Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/med-inventory
```

Содержимое конфигурации:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Ограничение размера тела запроса
    client_max_body_size 10M;
    
    # API проксирование
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
    
    # Статические файлы клиента
    location / {
        root /var/www/med-inventory/ui/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
```

Активация конфигурации:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/med-inventory /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

## Шаг 8: Установка SSL сертификата

```bash
# Установка Certbot (если не установлен)
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com

# Автообновление
sudo certbot renew --dry-run
```

## Шаг 9: Проверка работоспособности

### Проверка API

```bash
curl https://your-domain.com/api/health
```

Должно вернуть:

```json
{"status":"ok","timestamp":"..."}
```

### Проверка клиента

Откройте в браузере: `https://your-domain.com`

## Управление приложением

### Просмотр логов

```bash
pm2 logs med-inventory-api
pm2 logs med-inventory-api --lines 100
```

### Перезапуск

```bash
pm2 restart med-inventory-api
```

### Остановка

```bash
pm2 stop med-inventory-api
```

### Обновление приложения

```bash
# Остановка сервиса
pm2 stop med-inventory-api

# Обновление кода (Git)
cd /var/www/med-inventory
git pull

# Обновление зависимостей сервера
cd server
npm install --production

# Пересборка клиента
cd ../ui
npm install
npm run build

# Запуск
pm2 restart med-inventory-api
```

## Резервное копирование

### Бэкап базы данных

```bash
# Создание бэкапа
cp /var/lib/site2/maindb.sqlite /var/lib/site2/maindb.sqlite.backup-$(date +%Y%m%d)

# Или автоматический скрипт
# Создайте файл /usr/local/bin/backup-med-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/med-inventory"
mkdir -p $BACKUP_DIR
cp /var/lib/site2/maindb.sqlite $BACKUP_DIR/maindb-$(date +%Y%m%d-%H%M%S).sqlite
# Удаление бэкапов старше 30 дней
find $BACKUP_DIR -name "maindb-*.sqlite" -mtime +30 -delete
```

```bash
# Права на выполнение
chmod +x /usr/local/bin/backup-med-db.sh

# Добавление в cron (ежедневно в 2:00)
crontab -e
```

Добавьте строку:

```
0 2 * * * /usr/local/bin/backup-med-db.sh
```

## Мониторинг

### Настройка PM2 Monitoring (опционально)

```bash
pm2 monitor
```

### Проверка использования ресурсов

```bash
pm2 monit
```

## Решение проблем

### API не отвечает

```bash
# Проверка статуса
pm2 status

# Проверка логов
pm2 logs med-inventory-api --err

# Проверка порта
netstat -tulpn | grep 3001
```

### Nginx ошибки

```bash
# Проверка логов Nginx
sudo tail -f /var/log/nginx/error.log

# Проверка конфигурации
sudo nginx -t
```

### База данных недоступна

```bash
# Проверка файла БД
ls -lh /var/lib/site2/maindb.sqlite

# Проверка прав
sudo chown $USER:$USER /var/lib/site2/maindb.sqlite
```

## Безопасность

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban (защита от брутфорса)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Дополнительная настройка

### Изменение лимитов Node.js

Если требуется больше памяти:

```bash
pm2 delete med-inventory-api
pm2 start src/index.js --name med-inventory-api --node-args="--max-old-space-size=2048"
pm2 save
```

### Настройка логирования

```bash
# Ротация логов PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

✅ **Готово!** Приложение развёрнуто и работает на `https://your-domain.com`
