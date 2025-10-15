import dotenv from 'dotenv';
import { initDatabase, dbAll, dbRun } from './db.js';

dotenv.config();

// Примеры данных - по одному уникальному инструменту для каждого города
const testInstruments = [
  { city: 'Москва', name: 'Скальпель хирургический №11', category: 'Врачам', quantity: 25, status: 'available', note: 'Для операций' },
  { city: 'Краснодар', name: 'Зеркало стоматологическое', category: 'Студентам', quantity: 15, status: 'in_transit', note: 'В пути из склада' },
  { city: 'Волгоград', name: 'Шпатель зуботехнический', category: 'Зуботехникам', quantity: 30, status: 'available', note: 'Для лаборатории' },
];

async function seed() {
  try {
    console.log('🔧 Инициализация базы данных...');
    await initDatabase();
    
    console.log('🌱 Начало добавления тестовых данных...');

    // Получаем города
    const cities = await dbAll('SELECT id, name FROM cities');

    if (cities.length === 0) {
      console.log('❌ Города не найдены. Инициализация не удалась.');
      process.exit(1);
    }

    console.log('📋 Найдено городов:', cities.length);

    // Добавляем инструменты
    for (const instrument of testInstruments) {
      const city = cities.find(c => c.name === instrument.city);
      
      if (!city) {
        console.log(`⚠️  Город "${instrument.city}" не найден, пропускаем`);
        continue;
      }

      const lookup = `${instrument.name} ${instrument.category}`.toLowerCase();
      
      await dbRun(
        `INSERT INTO instruments (city_id, name, category, quantity, status, note, lookup, received_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))`,
        [city.id, instrument.name, instrument.category, instrument.quantity, instrument.status, instrument.note, lookup]
      );

      console.log(`✅ Добавлен: ${instrument.name} → ${instrument.city}`);
    }

    console.log('');
    console.log('✅ Тестовые данные успешно добавлены!');
    console.log('');
    console.log('📊 Итого:');
    console.log(`   Городов: ${cities.length}`);
    console.log(`   Инструментов: ${testInstruments.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении данных:', error);
    process.exit(1);
  }
}

seed();
