import express from 'express';
import { dbAll, dbGet, dbRun } from '../db.js';
import { basicAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories - Получить все категории
router.get('/', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY name');
    res.json({ data: categories, error: null });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Ошибка при получении категорий', data: null });
  }
});

// POST /api/categories - Создать категорию
router.post('/', basicAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Название категории обязательно', data: null });
    }

    const trimmedName = name.trim();

    // Проверка на дубликат
    const existing = await dbGet('SELECT * FROM categories WHERE name = ?', [trimmedName]);
    if (existing) {
      return res.status(409).json({ error: 'Категория с таким названием уже существует', data: null });
    }

    const result = await dbRun('INSERT INTO categories (name) VALUES (?)', [trimmedName]);
    const newCategory = await dbGet('SELECT * FROM categories WHERE id = ?', [result.lastID]);

    res.status(201).json({ data: newCategory, error: null });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({ error: 'Ошибка при создании категории', data: null });
  }
});

// PUT /api/categories/:id - Обновить категорию
router.put('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Название категории обязательно', data: null });
    }

    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена', data: null });
    }

    const trimmedName = name.trim();

    // Проверка на дубликат (кроме текущей)
    const existing = await dbGet('SELECT * FROM categories WHERE name = ? AND id != ?', [trimmedName, id]);
    if (existing) {
      return res.status(409).json({ error: 'Категория с таким названием уже существует', data: null });
    }

    await dbRun('UPDATE categories SET name = ? WHERE id = ?', [trimmedName, id]);
    const updatedCategory = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({ data: updatedCategory, error: null });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({ error: 'Ошибка при обновлении категории', data: null });
  }
});

// DELETE /api/categories/:id - Удалить категорию
router.delete('/:id', basicAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена', data: null });
    }

    await dbRun('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ data: { id: Number(id) }, error: null });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ error: 'Ошибка при удалении категории', data: null });
  }
});

export default router;
