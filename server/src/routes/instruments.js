import express from 'express';
import { dbAll, dbGet, dbRun } from '../db.js';
import { basicAuth } from '../middleware/auth.js';
import { validateInstrument } from '../middleware/validation.js';

const router = express.Router();

// GET /api/instruments - Получить все инструменты с фильтрами
router.get('/', async (req, res) => {
  try {
    const {
      cityId,
      category,
      status,
      q, // поиск
      archived = '0', // по умолчанию не архивные
      sortBy = 'id',
      order = 'desc',
      page = 1,
      pageSize = 50
    } = req.query;

    let sql = `
      SELECT 
        i.*,
        c.name as city_name
      FROM instruments i
      LEFT JOIN cities c ON i.city_id = c.id
      WHERE i.archived = ?
    `;
    const params = [archived === '1' ? 1 : 0];

    // Фильтры
    if (cityId) {
      sql += ' AND i.city_id = ?';
      params.push(cityId);
    }

    if (category) {
      sql += ' AND i.category = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (q) {
      sql += ' AND i.lookup LIKE ?';
      params.push(`%${q.toLowerCase()}%`);
    }

    // Подсчёт общего количества
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await dbGet(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Сортировка
    const validSortFields = ['id', 'name', 'quantity', 'received_at', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY i.${sortField} ${sortOrder}`;

    // Пагинация
    const limit = Math.min(Math.max(1, parseInt(pageSize)), 100);
    const offset = (Math.max(1, parseInt(page)) - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const instruments = await dbAll(sql, params);

    res.json({
      data: {
        items: instruments,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      },
      error: null
    });
  } catch (error) {
    console.error('Ошибка при получении инструментов:', error);
    res.status(500).json({ error: 'Ошибка при получении списка инструментов', data: null });
  }
});

// GET /api/instruments/:id - Получить инструмент по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instrument = await dbGet(`
      SELECT 
        i.*,
        c.name as city_name
      FROM instruments i
      LEFT JOIN cities c ON i.city_id = c.id
      WHERE i.id = ?
    `, [id]);

    if (!instrument) {
      return res.status(404).json({ error: 'Инструмент не найден', data: null });
    }

    res.json({ data: instrument, error: null });
  } catch (error) {
    console.error('Ошибка при получении инструмента:', error);
    res.status(500).json({ error: 'Ошибка при получении инструмента', data: null });
  }
});

// POST /api/instruments - Создать инструмент
router.post('/', basicAuth, validateInstrument, async (req, res) => {
  try {
    const { city_id, name, category, quantity, received_at, status, note } = req.body;

    // Проверка существования города
    const city = await dbGet('SELECT * FROM cities WHERE id = ?', [city_id]);
    if (!city) {
      return res.status(404).json({ error: 'Город не найден', data: null });
    }

    // Создание lookup-строки для поиска
    const lookup = `${name} ${category || ''}`.toLowerCase();

    const result = await dbRun(
      `INSERT INTO instruments (city_id, name, category, quantity, received_at, status, note, lookup)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [city_id, name, category || null, quantity || 0, received_at || null, status || 'available', note || null, lookup]
    );

    const newInstrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [result.lastID]);
    res.status(201).json({ data: newInstrument, error: null });
  } catch (error) {
    console.error('Ошибка при создании инструмента:', error);
    res.status(500).json({ error: 'Ошибка при создании инструмента', data: null });
  }
});

// PUT /api/instruments/:id - Обновить инструмент
router.put('/:id', basicAuth, validateInstrument, async (req, res) => {
  try {
    const { id } = req.params;
    const { city_id, name, category, quantity, received_at, status, note } = req.body;

    const instrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!instrument) {
      return res.status(404).json({ error: 'Инструмент не найден', data: null });
    }

    // Проверка существования города
    const city = await dbGet('SELECT * FROM cities WHERE id = ?', [city_id]);
    if (!city) {
      return res.status(404).json({ error: 'Город не найден', data: null });
    }

    // Обновление lookup-строки
    const lookup = `${name} ${category || ''}`.toLowerCase();

    // Автоматическое архивирование при quantity = 0
    const shouldArchive = quantity === 0 || quantity === '0';
    const archived = shouldArchive ? 1 : instrument.archived;

    await dbRun(
      `UPDATE instruments 
       SET city_id = ?, name = ?, category = ?, quantity = ?, received_at = ?, status = ?, note = ?, lookup = ?, archived = ?
       WHERE id = ?`,
      [city_id, name, category || null, quantity || 0, received_at || null, status || 'available', note || null, lookup, archived, id]
    );

    const updatedInstrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [id]);
    res.json({ data: updatedInstrument, error: null });
  } catch (error) {
    console.error('Ошибка при обновлении инструмента:', error);
    res.status(500).json({ error: 'Ошибка при обновлении инструмента', data: null });
  }
});

// PATCH /api/instruments/:id/archive - Архивировать/разархивировать инструмент
router.patch('/:id/archive', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    const instrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!instrument) {
      return res.status(404).json({ error: 'Инструмент не найден', data: null });
    }

    const archivedValue = archived ? 1 : 0;
    await dbRun('UPDATE instruments SET archived = ? WHERE id = ?', [archivedValue, id]);

    const updatedInstrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [id]);
    res.json({ data: updatedInstrument, error: null });
  } catch (error) {
    console.error('Ошибка при архивировании инструмента:', error);
    res.status(500).json({ error: 'Ошибка при архивировании инструмента', data: null });
  }
});

// DELETE /api/instruments/:id - Удалить инструмент
router.delete('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const instrument = await dbGet('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!instrument) {
      return res.status(404).json({ error: 'Инструмент не найден', data: null });
    }

    await dbRun('DELETE FROM instruments WHERE id = ?', [id]);
    res.json({ data: { id: Number(id) }, error: null });
  } catch (error) {
    console.error('Ошибка при удалении инструмента:', error);
    res.status(500).json({ error: 'Ошибка при удалении инструмента', data: null });
  }
});

export default router;
