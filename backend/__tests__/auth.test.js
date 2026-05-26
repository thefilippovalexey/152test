import request from 'supertest';
import express from 'express';
import { Router } from 'express';

// Мокаем зависимости перед импортом
const mockRegister = jest.fn();
const mockLogin = jest.fn();

jest.mock('../src/controllers/auth.controller.js', () => ({
  register: (req, res) => mockRegister(req, res),
  login: (req, res) => mockLogin(req, res)
}));

jest.mock('../src/controllers/documents.controller.js', () => ({
  generateDocuments: jest.fn()
}));

jest.mock('../middleware/auth.js', () => ({
  authMiddleware: (req, res, next) => next()
}));

const apiRoutes = await import('../src/routes/api.js');

const app = express();
app.use(express.json());
app.use('/api/auth', apiRoutes.default);
app.use('/api/documents', apiRoutes.default);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('должен возвращать 201 при успешной регистрации', async () => {
      mockRegister.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, email: req.body.email });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('должен возвращать 400 при отсутствии email', async () => {
      mockRegister.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Email и пароль обязательны' });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('должен возвращать токен при успешном входе', async () => {
      mockLogin.mockImplementation((req, res) => {
        res.json({ token: 'mock-jwt-token', user: { id: 1, email: req.body.email } });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('должен возвращать 401 при неверном пароле', async () => {
      mockLogin.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Неверный email или пароль' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
    });
  });
});
