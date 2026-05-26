import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    serverVersion: '1.0.0',
    apiVersion: 'v1',
    status: 'ok'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
