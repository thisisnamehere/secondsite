@echo off
echo ========================================
echo   Запуск приложения учета инструментов
echo ========================================
echo.

REM Проверка установки зависимостей
if not exist "server\node_modules" (
    echo [1/4] Установка зависимостей сервера...
    cd server
    call npm install
    cd ..
) else (
    echo [1/4] Зависимости сервера уже установлены
)

if not exist "ui\node_modules" (
    echo [2/4] Установка зависимостей клиента...
    cd ui
    call npm install
    cd ..
) else (
    echo [2/4] Зависимости клиента уже установлены
)

REM Проверка .env файлов
if not exist "server\.env" (
    echo [3/4] Создание server/.env из примера...
    copy server\.env.example server\.env
) else (
    echo [3/4] Файл server/.env уже существует
)

if not exist "ui\.env" (
    echo.
    echo Создание ui/.env из примера...
    copy ui\.env.example ui\.env
) else (
    echo Файл ui/.env уже существует
)

echo.
echo [4/4] Запуск приложения...
echo.
echo ========================================
echo   Открываются 2 окна:
echo   1. Сервер API (порт 3001)
echo   2. Клиент React (порт 5173)
echo ========================================
echo.
echo Для остановки нажмите Ctrl+C в каждом окне
echo.

REM Запуск сервера в новом окне
start "Med Inventory - Server" cmd /k "cd server && npm run dev"

REM Небольшая задержка
timeout /t 3 /nobreak > nul

REM Запуск клиента в новом окне
start "Med Inventory - Client" cmd /k "cd ui && npm start"

echo.
echo Приложение запускается...
echo Браузер откроется автоматически через несколько секунд
echo.
pause
