// Глобальний обробник помилок

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Помилка валідації
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  // Помилка авторизації
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  // Внутрішня помилка сервера
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
