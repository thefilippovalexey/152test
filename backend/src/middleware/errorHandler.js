export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  
  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
