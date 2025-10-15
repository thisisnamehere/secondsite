import express from 'express';
import { dbAll, dbGet, dbRun } from '../db.js';
import { basicAuth } from '../middleware/auth.js';
import { validateCity } from '../middleware/validation.js';

const router = express.Router();

// GET /api/cities - Получить все города
router.get('/', async (req, res) => {
  try {
    const cities = await dbAll(`
      SELECT 
        c.id, 
        c.name, 
        c.created_at,
        COUNT(i.id) as instruments_count
      FROM cities c
      LEFT JOIN instruments i ON c.id = i.city_id
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({ data: cities, error: null });
  } catch (error) {
    console.error('Ошибка при получении городов:', error);
    res.status(500).json({ error: 'Ошибка при получении списка городов', data: null });
  }
});

// GET /api/cities/:id - Получить город по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const city = await dbGet('SELECT * FROM cities WHERE id = ?', [id]);

    if (!city) {
      return res.status(404).json({ error: 'Город не найден', data: null });
    }

    res.json({ data: city, error: null });
  } catch (error) {
    console.error('Ошибка при получении города:', error);
    res.status(500).json({ error: 'Ошибка при получении города', data: null });
  }
});

// POST /api/cities - Создать город
router.post('/', basicAuth, validateCity, async (req, res) => {
  try {
    const { name } = req.body;

    // Проверка на дубликат
    const existing = await dbGet('SELECT * FROM cities WHERE name = ?', [name]);
    if (existing) {
      return res.status(409).json({ error: 'Город с таким названием уже существует', data: null });
    }

    const result = await dbRun('INSERT INTO cities (name) VALUES (?)', [name]);
    const newCity = await dbGet('SELECT * FROM cities WHERE id = ?', [result.lastID]);

    res.status(201).json({ data: newCity, error: null });
  } catch (error) {
    console.error('Ошибка при создании города:', error);
    res.status(500).json({ error: 'Ошибка при создании города', data: null });
  }
});

// PUT /api/cities/:id - Обновить город
router.put('/:id', basicAuth, validateCity, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const city = await dbGet('SELECT * FROM cities WHERE id = ?', [id]);
    if (!city) {
      return res.status(404).json({ error: 'Город не найден', data: null });
    }

    // Проверка на дубликат (кроме текущего)
    const existing = await dbGet('SELECT * FROM cities WHERE name = ? AND id != ?', [name, id]);
    if (existing) {
      return res.status(409).json({ error: 'Город с таким названием уже существует', data: null });
    }

    await dbRun('UPDATE cities SET name = ? WHERE id = ?', [name, id]);
    const updatedCity = await dbGet('SELECT * FROM cities WHERE id = ?', [id]);

    res.json({ data: updatedCity, error: null });
  } catch (error) {
    console.error('Ошибка при обновлении города:', error);
    res.status(500).json({ error: 'Ошибка при обновлении города', data: null });
  }
});

// DELETE /api/cities/:id - Удалить город
router.delete('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const city = await dbGet('SELECT * FROM cities WHERE id = ?', [id]);
    if (!city) {
      return res.status(404).json({ error: 'Город не найден', data: null });
    }

    // Проверка на наличие инструментов
    const instruments = await dbGet('SELECT COUNT(*) as count FROM instruments WHERE city_id = ?', [id]);
    if (instruments.count > 0) {
      return res.status(409).json({
        error: `Невозможно удалить город: в нём есть ${instruments.count} инструментов`,
        data: null
      });
    }

    await dbRun('DELETE FROM cities WHERE id = ?', [id]);
    res.json({ data: { id: Number(id) }, error: null });
  } catch (error) {
    console.error('Ошибка при удалении города:', error);
    res.status(500).json({ error: 'Ошибка при удалении города', data: null });
  }
});

export default router;
