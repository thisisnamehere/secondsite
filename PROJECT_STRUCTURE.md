# 📂 Структура проекта

Полная структура проекта учёта медицинского инструмента.

## Дерево директорий

```
med-inventory-2/
│
├── 📄 README.md                  # Основная документация
├── 📄 QUICKSTART.md              # Быстрый старт
├── 📄 DEPLOY.md                  # Инструкция по развёртыванию
├── 📄 PROJECT_STRUCTURE.md       # Этот файл
├── 📄 .gitignore                 # Игнорируемые файлы
├── 📄 .editorconfig              # Конфигурация редактора
├── 📄 .npmrc                     # NPM конфигурация
├── 📄 .env.example               # Пример переменных окружения
├── 📄 nginx.example.conf         # Пример конфигурации Nginx
├── 📄 med-inventory.service      # Systemd service файл
│
├── 📁 server/                    # СЕРВЕРНАЯ ЧАСТЬ
│   ├── 📁 src/
│   │   ├── 📁 routes/           # API маршруты
│   │   │   ├── cities.js        # CRUD для городов
│   │   │   ├── instruments.js   # CRUD для инструментов
│   │   │   └── export.js        # Экспорт в Excel
│   │   │
│   │   ├── 📁 middleware/       # Миддлвари
│   │   │   ├── auth.js          # Basic аутентификация
│   │   │   └── validation.js    # Валидация данных
│   │   │
│   │   ├── 📄 db.js             # Работа с SQLite БД
│   │   ├── 📄 index.js          # Точка входа сервера
│   │   └── 📄 seed.js           # Скрипт инициализации БД
│   │
│   ├── 📄 package.json           # Зависимости сервера
│   └── 📄 .env.example           # Пример переменных для сервера
│
└── 📁 ui/                        # КЛИЕНТСКАЯ ЧАСТЬ
    ├── 📁 src/
    │   ├── 📁 pages/            # Страницы приложения
    │   │   ├── HomePage.jsx     # Главная (список городов)
    │   │   └── CityPage.jsx     # Страница города (инструменты)
    │   │
    │   ├── 📁 components/       # Компоненты
    │   │   ├── Header.jsx              # Шапка приложения
    │   │   ├── CityCard.jsx            # Карточка города
    │   │   ├── AddCityModal.jsx        # Модалка добавления города
    │   │   ├── EditCityModal.jsx       # Модалка редактирования города
    │   │   ├── SearchAndFilters.jsx    # Поиск и фильтры
    │   │   ├── InstrumentsTable.jsx    # Таблица инструментов
    │   │   ├── AddInstrumentModal.jsx  # Модалка добавления инструмента
    │   │   └── EditInstrumentModal.jsx # Модалка редактирования инструмента
    │   │
    │   ├── 📁 lib/              # Утилиты и библиотеки
    │   │   ├── api.js           # API клиент (Axios)
    │   │   └── utils.js         # Вспомогательные функции
    │   │
    │   ├── 📄 App.jsx           # Главный компонент
    │   ├── 📄 main.jsx          # Точка входа React
    │   └── 📄 index.css         # Глобальные стили
    │
    ├── 📄 index.html             # HTML шаблон
    ├── 📄 package.json           # Зависимости клиента
    ├── 📄 vite.config.js         # Конфигурация Vite
    ├── 📄 tailwind.config.js     # Конфигурация TailwindCSS
    ├── 📄 postcss.config.js      # Конфигурация PostCSS
    └── 📄 .env.example           # Пример переменных для клиента
```

## Описание ключевых файлов

### Серверная часть

#### `server/src/index.js`
Главный файл сервера. Инициализирует Express, подключает миддлвари, маршруты и запускает сервер.

#### `server/src/db.js`
Модуль работы с базой данных:
- Подключение к SQLite
- Promise-обёртки для запросов
- Создание схемы и индексов
- Начальное наполнение данными

#### `server/src/routes/cities.js`
API для городов:
- `GET /api/cities` - список всех городов
- `GET /api/cities/:id` - получить город
- `POST /api/cities` - создать город (auth)
- `PUT /api/cities/:id` - обновить город (auth)
- `DELETE /api/cities/:id` - удалить город (auth)

#### `server/src/routes/instruments.js`
API для инструментов:
- `GET /api/instruments` - список с фильтрами, поиском, сортировкой
- `GET /api/instruments/:id` - получить инструмент
- `POST /api/instruments` - создать инструмент (auth)
- `PUT /api/instruments/:id` - обновить инструмент (auth)
- `DELETE /api/instruments/:id` - удалить инструмент (auth)

#### `server/src/routes/export.js`
Экспорт данных:
- `GET /api/export/instruments.xlsx` - экспорт в Excel

#### `server/src/middleware/auth.js`
Basic аутентификация для защиты изменяющих операций.

#### `server/src/middleware/validation.js`
Валидация и санитизация входных данных.

### Клиентская часть

#### `ui/src/App.jsx`
Корневой компонент с роутингом:
- `/` - главная страница (города)
- `/city/:cityId` - страница города (инструменты)

#### `ui/src/pages/HomePage.jsx`
Главная страница:
- Отображение сетки городов
- Добавление/редактирование/удаление городов
- Навигация в город

#### `ui/src/pages/CityPage.jsx`
Страница города:
- Таблица инструментов
- Поиск и фильтрация
- CRUD операции с инструментами
- Экспорт в Excel

#### `ui/src/components/`
Переиспользуемые компоненты UI:
- Карточки городов
- Модальные окна для форм
- Таблица с сортировкой и пагинацией
- Поиск и фильтры

#### `ui/src/lib/api.js`
Централизованный API-клиент:
- Настройка Axios
- Интерсепторы для авторизации
- Методы для всех эндпоинтов

#### `ui/src/lib/utils.js`
Вспомогательные функции:
- Debounce для поиска
- Форматирование дат
- Маппинг статусов

## Схема базы данных

### Таблица `cities`

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| name | TEXT | Название города (уникальное) |
| created_at | DATETIME | Дата создания |

### Таблица `instruments`

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| city_id | INTEGER | FK → cities.id |
| name | TEXT | Наименование |
| category | TEXT | Категория |
| quantity | INTEGER | Количество |
| received_at | DATE | Дата поступления |
| status | TEXT | Состояние (new/repair/disposed) |
| note | TEXT | Примечание |
| lookup | TEXT | Поле для поиска (lowercase) |
| created_at | DATETIME | Дата создания |

### Таблица `admins`

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ |
| login | TEXT | Логин (уникальный) |
| password | TEXT | Пароль |
| super | BOOLEAN | Супер-админ |
| created_at | DATETIME | Дата создания |

### Индексы

- `idx_instruments_city` - по city_id
- `idx_instruments_category` - по category
- `idx_instruments_status` - по status
- `idx_instruments_received` - по received_at
- `idx_instruments_quantity` - по quantity
- `idx_instruments_lookup` - по lookup

## Порты и URL

### Локальная разработка

- **Сервер API**: `http://localhost:3001`
- **Клиент**: `http://localhost:5173`

### Продакшн

- **Приложение**: `https://site2.example.com`
- **API**: `https://site2.example.com/api`
- **Сервер (внутренний)**: `http://127.0.0.1:3001`

## Переменные окружения

### Сервер (server/.env)

```env
PORT=3001                                    # Порт API сервера
DB_FILE=./maindb.sqlite                      # Путь к БД (локально)
DB_FILE=/var/lib/site2/maindb.sqlite         # Путь к БД (продакшн)
CORS_ORIGIN=http://localhost:5173            # CORS origin (локально)
CORS_ORIGIN=https://site2.example.com        # CORS origin (продакшн)
ADMIN_LOGIN=admin                            # Логин админа
ADMIN_PASSWORD=changeme                      # Пароль админа
```

### Клиент (ui/.env)

```env
VITE_API_BASE_URL=http://localhost:3001      # API URL (локально)
VITE_API_BASE_URL=https://site2.example.com  # API URL (продакшн)
```

## Зависимости

### Сервер

- express@^5.0.1
- sqlite3@^5.1.7
- dotenv@^16.4.5
- cors@^2.8.5
- helmet@^8.0.0
- compression@^1.7.4
- exceljs@^4.4.0

### Клиент

- react@^18.3.1
- react-dom@^18.3.1
- react-router-dom@^6.28.0
- framer-motion@^11.11.11
- react-hook-form@^7.53.2
- react-icons@^5.3.0
- axios@^1.7.7
- sweetalert2@^11.14.5
- react-toastify@^10.0.6
- xlsx@0.20.3
- vite@^5.4.10
- tailwindcss@^3.4.14

## Скрипты

### Сервер

```bash
npm start      # Запуск продакшн
npm run dev    # Запуск с автоперезагрузкой
npm run seed   # Инициализация БД
```

### Клиент

```bash
npm start      # Dev-сервер
npm run build  # Сборка
npm run preview # Предпросмотр сборки
```

## Архитектура

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│    Nginx    │────────▶│  Express    │
│  (React)    │◀────────│   (Proxy)   │◀────────│   (API)     │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                                                       ▼
                                                ┌─────────────┐
                                                │   SQLite    │
                                                │  (Database) │
                                                └─────────────┘
```

## Особенности реализации

✅ **Независимое развёртывание** - отдельный порт, БД, папка
✅ **Персистентное хранилище** - SQLite с автосозданием схемы
✅ **REST API** - полноценный CRUD с фильтрацией
✅ **Валидация** - на сервере и клиенте
✅ **Безопасность** - Helmet, CORS, Basic Auth
✅ **Анимации** - Framer Motion
✅ **Уведомления** - Toasts и модалки
✅ **Экспорт** - Excel через ExcelJS
✅ **Адаптивность** - Responsive design
✅ **Поиск** - с debounce оптимизацией
✅ **Пагинация** - для больших списков
✅ **Сортировка** - по любому полю

## Лицензия

ISC
