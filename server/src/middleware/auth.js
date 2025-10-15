// Миддлварь для Basic Auth
export const basicAuth = (req, res, next) => {
  // Если ADMIN_LOGIN не задан, пропускаем авторизацию
  if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: 'Требуется авторизация',
      data: null
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [login, password] = credentials.split(':');

    // Проверяем credentials из переменных окружения
    if (login !== process.env.ADMIN_LOGIN || password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({
        error: 'Неверные учётные данные',
        data: null
      });
    }

    req.admin = { login };
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({
      error: 'Ошибка сервера при авторизации',
      data: null
    });
  }
};
