#!/bin/bash

echo "========================================"
echo "  Запуск приложения учета инструментов"
echo "========================================"
echo ""

# Проверка установки зависимостей
if [ ! -d "server/node_modules" ]; then
    echo "[1/4] Установка зависимостей сервера..."
    cd server
    npm install
    cd ..
else
    echo "[1/4] Зависимости сервера уже установлены"
fi

if [ ! -d "ui/node_modules" ]; then
    echo "[2/4] Установка зависимостей клиента..."
    cd ui
    npm install
    cd ..
else
    echo "[2/4] Зависимости клиента уже установлены"
fi

# Проверка .env файлов
if [ ! -f "server/.env" ]; then
    echo "[3/4] Создание server/.env из примера..."
    cp server/.env.example server/.env
else
    echo "[3/4] Файл server/.env уже существует"
fi

if [ ! -f "ui/.env" ]; then
    echo ""
    echo "Создание ui/.env из примера..."
    cp ui/.env.example ui/.env
else
    echo "Файл ui/.env уже существует"
fi

echo ""
echo "[4/4] Запуск приложения..."
echo ""
echo "========================================"
echo "  Запуск сервера и клиента..."
echo "========================================"
echo ""

# Функция для остановки процессов при выходе
cleanup() {
    echo ""
    echo "Остановка приложения..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Запуск сервера в фоне
cd server
npm run dev &
SERVER_PID=$!
cd ..

echo "✅ Сервер запущен (PID: $SERVER_PID)"
echo "⏳ Ожидание инициализации..."
sleep 3

# Запуск клиента в фоне
cd ui
npm start &
CLIENT_PID=$!
cd ..

echo "✅ Клиент запущен (PID: $CLIENT_PID)"
echo ""
echo "========================================"
echo "  Приложение работает!"
echo "  Сервер: http://localhost:3001"
echo "  Клиент: http://localhost:5173"
echo "========================================"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Ожидание завершения
wait
