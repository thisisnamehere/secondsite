import express from 'express';
import ExcelJS from 'exceljs';
import { dbAll } from '../db.js';

const router = express.Router();

// GET /api/export/instruments.xlsx - Экспорт в Excel
router.get('/instruments.xlsx', async (req, res) => {
  try {
    const { cityId, category, status, q } = req.query;

    let sql = `
      SELECT 
        i.*,
        c.name as city_name
      FROM instruments i
      LEFT JOIN cities c ON i.city_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Применяем те же фильтры, что и в GET /instruments
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

    sql += ' ORDER BY i.id DESC';

    const instruments = await dbAll(sql, params);

    // Создаём Excel файл
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Инструменты');

    // Заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Город', key: 'city_name', width: 20 },
      { header: 'Наименование', key: 'name', width: 40 },
      { header: 'Категория', key: 'category', width: 20 },
      { header: 'Количество', key: 'quantity', width: 12 },
      { header: 'Дата поступления', key: 'received_at', width: 16 },
      { header: 'Состояние', key: 'status', width: 12 },
      { header: 'Примечание', key: 'note', width: 30 }
    ];

    // Стилизация заголовков
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Добавляем данные
    instruments.forEach(item => {
      const statusMap = {
        'available': 'В наличии',
        'in_transit': 'В пути',
        'out_of_stock': 'Отсутствует'
      };

      worksheet.addRow({
        id: item.id,
        city_name: item.city_name,
        name: item.name,
        category: item.category || '',
        quantity: item.quantity,
        received_at: item.received_at || '',
        status: statusMap[item.status] || item.status,
        note: item.note || ''
      });
    });

    // Установка заголовков ответа
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=instruments.xlsx');

    // Отправка файла
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    res.status(500).json({ error: 'Ошибка при экспорте данных', data: null });
  }
});

export default router;
