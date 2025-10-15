import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к БД из переменных окружения или по умолчанию
const dbPath = process.env.DB_FILE || resolve(__dirname, '../../maindb.sqlite');

// Создаём директорию для БД, если её нет
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Подключение к SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
    process.exit(1);
  }
  console.log('✅ Подключено к базе данных:', dbPath);
});

// Включаем поддержку внешних ключей
db.run('PRAGMA foreign_keys = ON');

// Promise-обёртки для работы с БД
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Инициализация схемы БД
export const initDatabase = async () => {
  try {
    console.log('🔧 Инициализация схемы БД...');

    // Таблица городов
    await dbRun(`
      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица категорий
    await dbRun(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица инструментов
    await dbRun(`
      CREATE TABLE IF NOT EXISTS instruments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        received_at DATE,
        status TEXT DEFAULT 'available',
        note TEXT,
        lookup TEXT,
        archived BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
      )
    `);

    // Индексы для быстрого поиска
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_city ON instruments(city_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_category ON instruments(category)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_status ON instruments(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_received ON instruments(received_at)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_quantity ON instruments(quantity)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_instruments_lookup ON instruments(lookup)');

    // КРИТИЧЕСКИ ВАЖНО: Проверяем наличие колонки archived
    const columns = await dbAll("PRAGMA table_info(instruments)");
    const hasArchived = columns.some(col => col.name === 'archived');
    
    if (!hasArchived) {
      console.log('⚠️  Добавление колонки archived в таблицу instruments...');
      await dbRun('ALTER TABLE instruments ADD COLUMN archived BOOLEAN DEFAULT 0');
      console.log('✅ Колонка archived добавлена');
    }

    // Проверяем, есть ли города
    const citiesCount = await dbGet('SELECT COUNT(*) as count FROM cities');
    if (citiesCount.count === 0) {
      console.log('📍 Добавление начальных городов...');
      const cities = ['Москва', 'Краснодар', 'Волгоград'];
      for (const city of cities) {
        await dbRun('INSERT INTO cities (name) VALUES (?)', [city]);
      }
      console.log('✅ Добавлено городов:', cities.length);
    }

    // Проверяем, есть ли категории
    const categoriesCount = await dbGet('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount.count === 0) {
      console.log('📋 Добавление начальных категорий...');
      const categories = ['Врачам', 'Студентам', 'Зуботехникам'];
      for (const category of categories) {
        await dbRun('INSERT INTO categories (name) VALUES (?)', [category]);
      }
      console.log('✅ Добавлено категорий:', categories.length);
    }

    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    throw error;
  }
};

export default db;
