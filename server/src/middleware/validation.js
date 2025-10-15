// Валидация данных города
export const validateCity = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Название города обязательно и должно быть строкой',
      data: null
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      error: 'Название города не может быть длиннее 100 символов',
      data: null
    });
  }

  req.body.name = name.trim();
  next();
};

// Валидация данных инструмента
export const validateInstrument = (req, res, next) => {
  const { city_id, name, category, quantity, received_at, status, note } = req.body;

  // Проверка city_id
  if (!city_id || !Number.isInteger(Number(city_id)) || Number(city_id) <= 0) {
    return res.status(400).json({
      error: 'city_id обязателен и должен быть положительным целым числом',
      data: null
    });
  }

  // Проверка name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Наименование инструмента обязательно',
      data: null
    });
  }

  if (name.length > 200) {
    return res.status(400).json({
      error: 'Наименование не может быть длиннее 200 символов',
      data: null
    });
  }

  // Проверка quantity
  if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
    return res.status(400).json({
      error: 'Количество должно быть неотрицательным целым числом',
      data: null
    });
  }

  // Проверка status
  const validStatuses = ['available', 'in_transit', 'out_of_stock'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Статус должен быть одним из: ${validStatuses.join(', ')}`,
      data: null
    });
  }

  // Проверка даты
  if (received_at && isNaN(Date.parse(received_at))) {
    return res.status(400).json({
      error: 'Некорректный формат даты',
      data: null
    });
  }

  // Санитизация
  req.body.name = name.trim();
  if (category) req.body.category = category.trim();
  if (note) req.body.note = note.trim();

  next();
};
