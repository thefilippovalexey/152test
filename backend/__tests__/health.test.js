import request from 'supertest';
import express from 'express';

const app = express();

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    serverVersion: '1.0.0',
    apiVersion: 'v1',
    status: 'ok'
  });
});

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('должен возвращать статус ok и правильные версии', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        serverVersion: '1.0.0',
        apiVersion: 'v1',
        status: 'ok'
      });
    });

    it('должен возвращать Content-Type application/json', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
