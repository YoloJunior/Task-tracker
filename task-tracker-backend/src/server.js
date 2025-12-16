// Головний файл сервера

const express = require('express');  // веб-фреймворк
const cors = require('cors');        // дозволяє запити з frontend
require('dotenv').config();          // змінні середовища

// Маршрути
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const statusRoutes = require('./routes/statuses');
const tagRoutes = require('./routes/tags');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // парсинг JSON

// API маршрути
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/tags', tagRoutes);

// Перевірка роботи сервера
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Tracker API is running' });
});

app.use(errorHandler);

// 404 для неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
