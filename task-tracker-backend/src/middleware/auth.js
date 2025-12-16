// Middleware автентифікації

const jwt = require('jsonwebtoken');

// Перевірка JWT токена
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // зберігаємо дані користувача
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Перевірка ролі адміна
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { auth, isAdmin };
