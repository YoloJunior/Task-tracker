// Контролер автентифікації

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');    // хешування паролів
const jwt = require('jsonwebtoken'); // JWT токени

const prisma = new PrismaClient();

// Реєстрація користувача
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Валідація
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Invalid input. Email required and password must be at least 6 characters' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Перевірка чи email вже існує
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Хешуємо пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Створюємо користувача
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'user'
      }
    });

    // Генеруємо токен (24 години)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Вхід користувача
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Шукаємо користувача
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Перевіряємо пароль
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Генеруємо токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримання поточного користувача
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновлення профілю
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримання всіх користувачів (для адміна)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: error.message });
  }
};
