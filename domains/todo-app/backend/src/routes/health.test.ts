import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Health Check API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/health', () => {
    it('should return 200 with healthy status when database is connected', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('database', 'connected');
      expect(response.body.data).toHaveProperty('uptime');
      expect(typeof response.body.data.uptime).toBe('number');
    });

    it('should include all required fields in response', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: 'healthy',
          database: 'connected',
          uptime: expect.any(Number),
        })
      );
    });

    it('should return uptime as a positive number', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 503 when database is unavailable', async () => {
      // 断开数据库连接来模拟数据库不可用
      await prisma.$disconnect();

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Database unavailable');
    });
  });
});
