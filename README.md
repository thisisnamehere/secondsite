# 🏥 Система учёта медицинского инструмента

Независимое веб-приложение для учёта медицинского инструмента с отдельным клиентом (React + Vite) и сервером (Node.js + Express) с персистентным хранением данных в SQLite.

## 📋 Содержание

- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Локальный запуск](#локальный-запуск)
- [API документация](#api-документация)
- [Деплой на Timeweb Cloud](#деплой-на-timeweb-cloud)
- [Безопасность](#безопасность)
- [Функциональность](#функциональность)

## 🛠 Технологический стек

### Клиент
- **React 18+** - библиотека для создания интерфейса
- **Vite** - сборщик и dev-сервер
- **React Router DOM** - маршрутизация
- **Framer Motion** - анимации
- **TailwindCSS** - стилизация
- **React Hook Form** - управление формами
- **React Icons** - иконки
- **Axios** - HTTP-клиент
- **SweetAlert2** - модальные окна подтверждений
- **React Toastify** - уведомления
- **XLSX** - экспорт в Excel

### Сервер
- **Node.js 20+** - серверная платформа
- **Express 5** - веб-фреймворк
- **SQLite3** - база данных
- **dotenv** - переменные окружения
- **CORS** - кросс-доменные запросы
- **Helmet** - защита заголовков
- **Compression** - сжатие ответов
- **ExcelJS** - генерация Excel-файлов

## 📁 Структура проекта

```
med-inventory-2/
├── server/                # Серверная часть
│   ├── src/
│   │   ├── routes/       # API маршруты
│   │   │   ├── cities.js
│   │   │   ├── instruments.js
│   │   │   └── export.js
│   │   ├── middleware/   # Миддлвари
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── db.js         # Работа с БД
│   │   └── index.js      # Точка входа
│   ├── .env.example
│   └── package.json
├── ui/                   # Клиентская часть
│   ├── src/
│   │   ├── components/   # Компоненты
│   │   ├── pages/        # Страницы
│   │   ├── lib/          # Утилиты и API
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore
├── .env.example
└── README.md
```

## 🚀 Локальный запуск

### Предварительные требования

- **Node.js** версии 20 или выше
- **npm** или **yarn**

### 1. Клонирование и установка зависимостей

```bash
# Переход в директорию проекта
cd med-inventory-2

# Установка зависимостей сервера
cd server
npm install

# Установка зависимостей клиента
cd ../ui
npm install
```

### 2. Настройка переменных окружения

#### Сервер (server/.env)

Создайте файл `server/.env` на основе `server/.env.example`:

```env
PORT=3001
DB_FILE=./maindb.sqlite
CORS_ORIGIN=http://localhost:5173
ADMIN_LOGIN=admin
ADMIN_PASSWORD=changeme
```

#### Клиент (ui/.env)

Создайте файл `ui/.env` на основе `ui/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Запуск приложения

#### Запуск сервера

```bash
cd server
npm run dev
```

Сервер запустится на порту **3001**. При первом запуске:
- Автоматически создастся база данных SQLite
- Добавятся начальные города: Москва, Краснодар, Волгоград
- Создастся супер-администратор (если указаны ADMIN_LOGIN и ADMIN_PASSWORD)

#### Запуск клиента

В отдельном терминале:

```bash
cd ui
npm start
```

Клиент запустится на порту **5173** и откроется в браузере по адресу `http://localhost:5173`

### 4. Проверка работоспособности

1. Откройте браузер по адресу `http://localhost:5173`
2. Вы должны увидеть главную страницу с городами
3. Попробуйте добавить новый город
4. Перейдите в город и добавьте инструмент
5. Проверьте фильтры, поиск и экспорт в Excel

## 📡 API документация

Базовый путь: `/api`

### Города

| Метод | Endpoint | Описание | Требует Auth |
|-------|----------|----------|--------------|
| GET | `/api/cities` | Получить все города | Нет |
| GET | `/api/cities/:id` | Получить город по ID | Нет |
| POST | `/api/cities` | Создать город | Да |
| PUT | `/api/cities/:id` | Обновить город | Да |
| DELETE | `/api/cities/:id` | Удалить город | Да |

### Инструменты

| Метод | Endpoint | Описание | Требует Auth |
|-------|----------|----------|--------------|
| GET | `/api/instruments` | Получить инструменты | Нет |
| GET | `/api/instruments/:id` | Получить инструмент по ID | Нет |
| POST | `/api/instruments` | Создать инструмент | Да |
| PUT | `/api/instruments/:id` | Обновить инструмент | Да |
| DELETE | `/api/instruments/:id` | Удалить инструмент | Да |

#### Параметры фильтрации GET /api/instruments

- `cityId` - фильтр по городу
- `category` - фильтр по категории
- `status` - фильтр по состоянию (new, repair, disposed)
- `q` - поиск по наименованию
- `sortBy` - сортировка (id, name, quantity, received_at)
- `order` - порядок (asc, desc)
- `page` - номер страницы
- `pageSize` - элементов на странице (макс. 100)

### Экспорт

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/export/instruments.xlsx` | Экспорт в Excel |

Поддерживает те же параметры фильтрации, что и GET /instruments

### Формат ответов

```json
{
  "data": { ... },
  "error": null
}
```

В случае ошибки:

```json
{
  "data": null,
  "error": "Описание ошибки"
}
```

## 🌐 Деплой на Timeweb Cloud

### 1. Подготовка сервера

```bash
# Подключение по SSH
ssh user@your-server.com

# Создание директории проекта
mkdir -p /var/www/med-inventory
cd /var/www/med-inventory

# Клонирование проекта (или загрузка через FTP/SFTP)
git clone <your-repo-url> .

# Создание директории для базы данных
sudo mkdir -p /var/lib/site2
sudo chown -R $USER:$USER /var/lib/site2
```

### 2. Установка зависимостей

```bash
# Установка зависимостей сервера
cd /var/www/med-inventory/server
npm install --production

# Установка зависимостей и сборка клиента
cd /var/www/med-inventory/ui
npm install
npm run build
```

### 3. Настройка переменных окружения

Создайте файл `/var/www/med-inventory/server/.env`:

```env
PORT=3001
DB_FILE=/var/lib/site2/maindb.sqlite
CORS_ORIGIN=https://site2.example.com
ADMIN_LOGIN=admin
ADMIN_PASSWORD=your_secure_password
```

### 4. Запуск с PM2 (рекомендуется)

```bash
# Установка PM2 глобально (если не установлен)
npm install -g pm2

# Запуск сервера
cd /var/www/med-inventory/server
pm2 start src/index.js --name med-inventory-api

# Сохранение конфигурации
pm2 save
pm2 startup
```

### 5. Настройка Nginx

Создайте файл `/etc/nginx/sites-available/med-inventory`:

```nginx
server {
    server_name site2.example.com;
    
    # API проксирование
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Статические файлы клиента
    location / {
        root /var/www/med-inventory/ui/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Активация конфигурации:

```bash
sudo ln -s /etc/nginx/sites-available/med-inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL сертификат (Certbot)

```bash
sudo certbot --nginx -d site2.example.com
```

### 7. Проверка

- API: `https://site2.example.com/api/health`
- Клиент: `https://site2.example.com`

## 🔒 Безопасность

### Basic Authentication

Если в переменных окружения указаны `ADMIN_LOGIN` и `ADMIN_PASSWORD`, все изменяющие операции (POST, PUT, DELETE) будут защищены Basic Auth.

#### Настройка в клиенте

Если требуется авторизация, добавьте в localStorage:

```javascript
const credentials = btoa('admin:password');
localStorage.setItem('admin_credentials', credentials);
```

### Дополнительные меры безопасности

- ✅ Helmet для защиты заголовков
- ✅ CORS с ограничением по origin
- ✅ Валидация входных данных
- ✅ Санитизация строк
- ✅ Ограничение размера тела запроса (10MB)
- ✅ Foreign keys в SQLite для целостности данных

## ✨ Функциональность

### 🔐 Авторизация (НОВОЕ!)

- ⭐ **Обязательный вход** - никакого доступа без авторизации
- 👤 **Учётные данные** - логин/пароль из переменных окружения
- 💾 **Запомнить меня** - credentials сохраняются в localStorage
- 🚪 **Выход** - кнопка выхода в шапке приложения

**Данные по умолчанию:** admin / admin123

### 🗂️ Управление категориями (НОВОЕ!)

- ➕ **Добавление** категорий через UI
- ✏️ **Редактирование** inline в модальном окне
- 🗑️ **Удаление** с подтверждением
- 📋 **Начальные категории**: "Врачам", "Студентам", "Зуботехникам"
- 🔄 **Динамическая загрузка** - категории автоматически появляются в фильтрах

### 📦 Архивирование инструментов (НОВОЕ!)

- 🔄 **Автоархивирование** - при quantity = 0
- 📁 **Раздельный просмотр** - активные / архивные
- ↩️ **Восстановление** - из архива обратно
- 🚫 **Защита** - нельзя редактировать архивные

### 🏙️ Управление городами

- ➕ Добавление новых городов
- ✏️ Редактирование названий
- 🗑️ Удаление городов (с проверкой на наличие инструментов)
- 📊 Отображение количества инструментов в каждом городе

### 🔧 Управление инструментами

- ➕ Добавление инструментов
- ✏️ Редактирование данных
- 🗑️ Удаление инструментов
- 📦 Архивирование/восстановление
- 🔍 Поиск по наименованию (с debounce 500ms)
- 🏷️ Фильтрация по категории и состоянию
- ⬆️⬇️ Сортировка по количеству, дате, имени
- 📄 Пагинация (20 элементов на страницу)
- 📊 Экспорт в Excel с учётом текущих фильтров

### 📊 Статусы инструментов (ОБНОВЛЕНО!)

- ✅ **В наличии** (available) - зелёный бейдж
- 🚚 **В пути** (in_transit) - жёлтый бейдж
- ❌ **Отсутствует** (out_of_stock) - красный бейдж

### UX/UI особенности

- 🎨 **Apple Design System** - светлые тона, мягкие тени, скруглённые углы
- ✨ **Анимации** - плавные переходы через Framer Motion
- 📱 **Адаптивность** - работает на ПК, планшетах и смартфонах
- 🔔 **Уведомления** - toast-сообщения о успехе/ошибках
- ⚠️ **Подтверждения** - модальные окна для критичных действий
- ⚡ **Оптимизация** - debounce для поиска, ленивая загрузка

## 🧪 Разработка

### Структура компонентов

- `pages/` - страницы (HomePage, CityPage)
- `components/` - переиспользуемые компоненты
- `lib/` - утилиты и API-клиент
- `hooks/` - кастомные хуки (при необходимости)

### Код-стайл

- Используется ES modules
- Async/await для асинхронных операций
- React Hooks (useState, useEffect, useCallback)
- Контролируемые формы через react-hook-form

### База данных

- **SQLite** - файловая БД, автоматически создаётся при старте
- **Foreign keys** - включены для целостности
- **Индексы** - для оптимизации запросов
- **Lookup-поле** - для полнотекстового поиска

## 📝 Скрипты

### Сервер

```bash
npm start       # Запуск продакшн-сервера
npm run dev     # Запуск с автоперезагрузкой (--watch)
npm run migrate # Миграция БД (обновление схемы)
npm run seed    # Заполнение тестовыми данными
```

### Клиент

```bash
npm start      # Запуск dev-сервера
npm run build  # Сборка для продакшена
npm run preview # Предпросмотр сборки
```

## 🐛 Отладка

### Проверка логов сервера

```bash
# Логи PM2
pm2 logs med-inventory-api

# Или прямой запуск с логами
cd server
node src/index.js
```

### Проверка БД

```bash
sqlite3 /var/lib/site2/maindb.sqlite

# В sqlite3:
.tables
SELECT * FROM cities;
SELECT * FROM instruments LIMIT 10;
.exit
```

## 📜 Лицензия

ISC

---

**Разработано для независимого развёртывания на Timeweb Cloud** 🚀
#   s e c o n d s i t e  
 