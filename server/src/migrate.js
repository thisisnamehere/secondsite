import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = process.env.DB_FILE || resolve(__dirname, '../../maindb.sqlite');

// Promise-обёртки
function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbExec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function migrate() {
  const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к БД:', err.message);
      process.exit(1);
    }
  });

  // Включаем foreign keys
  await dbRun(db, 'PRAGMA foreign_keys = ON');

  console.log('🔄 Начало миграции базы данных...');

  try {
    // Проверяем наличие таблицы cities
    const citiesTable = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='cities'"
    );

    if (!citiesTable) {
      console.log('📍 Создание таблицы cities...');
      await dbExec(db, `
        CREATE TABLE cities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Добавляем начальные города
      const cities = ['Москва', 'Краснодар', 'Волгоград'];
      for (const city of cities) {
        await dbRun(db, 'INSERT INTO cities (name) VALUES (?)', [city]);
      }
      console.log('✅ Таблица cities создана и заполнена');
    } else {
      console.log('✓ Таблица cities уже существует');
    }

    // Проверяем наличие таблицы categories
    const categoriesTable = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='categories'"
    );

    if (!categoriesTable) {
      console.log('📋 Создание таблицы categories...');
      await dbExec(db, `
        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Добавляем начальные категории
      const categories = ['Врачам', 'Студентам', 'Зуботехникам'];
      for (const category of categories) {
        await dbRun(db, 'INSERT INTO categories (name) VALUES (?)', [category]);
      }
      console.log('✅ Таблица categories создана и заполнена');
    } else {
      console.log('✓ Таблица categories уже существует');
    }

    // Проверяем наличие таблицы instruments
    const instrumentsTable = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='instruments'"
    );

    if (!instrumentsTable) {
      console.log('🔧 Создание таблицы instruments...');
      await dbExec(db, `
        CREATE TABLE instruments (
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
      
      // Создаём индексы
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_city ON instruments(city_id)');
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_category ON instruments(category)');
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_status ON instruments(status)');
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_received ON instruments(received_at)');
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_quantity ON instruments(quantity)');
      await dbExec(db, 'CREATE INDEX IF NOT EXISTS idx_instruments_lookup ON instruments(lookup)');
      
      console.log('✅ Таблица instruments создана с индексами');
    } else {
      console.log('✓ Таблица instruments уже существует');
    }

    // Проверяем наличие поля archived в таблице instruments
    const columns = await dbAll(db, "PRAGMA table_info(instruments)");
    const hasArchived = columns.some(col => col.name === 'archived');

    if (!hasArchived) {
      console.log('📦 Добавление поля archived в таблицу instruments...');
      await dbExec(db, 'ALTER TABLE instruments ADD COLUMN archived BOOLEAN DEFAULT 0');
      console.log('✅ Поле archived добавлено');
    } else {
      console.log('✓ Поле archived уже существует');
    }

    // Обновляем старые статусы на новые (опционально)
    console.log('🔄 Обновление статусов...');
    await dbRun(db, "UPDATE instruments SET status = 'available' WHERE status = 'new'");
    await dbRun(db, "UPDATE instruments SET status = 'in_transit' WHERE status = 'repair'");
    await dbRun(db, "UPDATE instruments SET status = 'out_of_stock' WHERE status = 'disposed'");
    console.log('✅ Статусы обновлены');

    // Архивируем инструменты с quantity = 0
    const result = await dbRun(db, 'UPDATE instruments SET archived = 1 WHERE quantity = 0 AND archived = 0');
    if (result.changes > 0) {
      console.log(`📦 Автоматически архивировано инструментов: ${result.changes}`);
    }

    console.log('');
    console.log('✅ Миграция завершена успешно!');
    console.log('');
    
    // Статистика
    const stats = await dbGet(db, `
      SELECT 
        (SELECT COUNT(*) FROM cities) as cities,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM instruments WHERE archived = 0) as active_instruments,
        (SELECT COUNT(*) FROM instruments WHERE archived = 1) as archived_instruments
    `);
    
    console.log('📊 Статистика базы данных:');
    console.log(`   Городов: ${stats.cities}`);
    console.log(`   Категорий: ${stats.categories}`);
    console.log(`   Активных инструментов: ${stats.active_instruments}`);
    console.log(`   Архивных инструментов: ${stats.archived_instruments}`);
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    db.close();
    process.exit(1);
  } finally {
    db.close();
  }
}

migrate();
