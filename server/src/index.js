import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { initDatabase } from './db.js';
import { basicAuth } from './middleware/auth.js';
import citiesRouter from './routes/cities.js';
import categoriesRouter from './routes/categories.js';
import instrumentsRouter from './routes/instruments.js';
import exportRouter from './routes/export.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use('/api/cities', citiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/instruments', instrumentsRouter);
app.use('/api/export', exportRouter);

// Health check с проверкой авторизации
app.get('/api/health', basicAuth, (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    user: req.admin?.login 
  });
});

const distPath = resolve(__dirname, '../../ui/dist');
app.use(express.static(distPath));

// SPA fallback - все остальные запросы отдают index.html (только для продакшена)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(resolve(distPath, 'index.html'), (err) => {
      if (err) {
        // Если файл не найден (режим разработки), пропускаем
        next();
      }
    });
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    data: null
  });
});

await initDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
});
