import dotenv from 'dotenv';
import { dbRun, dbGet } from './db.js';

dotenv.config();

async function testAdd() {
  try {
    console.log('🧪 Тестовое добавление инструмента...');
    
    // Проверяем что город существует
    const city = await dbGet('SELECT * FROM cities WHERE id = 1');
    console.log('Город:', city);
    
    if (!city) {
      console.log('❌ Город с ID 1 не найден');
      process.exit(1);
    }
    
    // Добавляем инструмент
    const testInstrument = {
      city_id: 1,
      name: 'Тестовый скальпель',
      category: 'Врачам',
      quantity: 10,
      status: 'available',
      note: 'Тестовый инструмент',
      lookup: 'тестовый скальпель врачам',
      received_at: new Date().toISOString().split('T')[0]
    };
    
    const result = await dbRun(
      `INSERT INTO instruments (city_id, name, category, quantity, status, note, lookup, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testInstrument.city_id,
        testInstrument.name,
        testInstrument.category,
        testInstrument.quantity,
        testInstrument.status,
        testInstrument.note,
        testInstrument.lookup,
        testInstrument.received_at
      ]
    );
    
    console.log('✅ Инструмент добавлен с ID:', result.lastID);
    
    // Проверяем что инструмент добавился
    const added = await dbGet('SELECT * FROM instruments WHERE id = ?', [result.lastID]);
    console.log('Добавленный инструмент:', added);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testAdd();
