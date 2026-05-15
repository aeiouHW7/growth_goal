import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import cache from '../utils/cache';

const prisma = new PrismaClient();

describe('TODO API Endpoints', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await prisma.todo.deleteMany({});
    cache.flushAll(); // 清除所有缓存
  });

  // Clean up and disconnect after all tests
  afterAll(async () => {
    await prisma.todo.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all todos', async () => {
      // Create test data
      await prisma.todo.createMany({
        data: [
          { title: 'Test Todo 1', completed: false },
          { title: 'Test Todo 2', completed: true },
        ],
      });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        title: 'New Test Todo',
        completed: false,
      };

      const response = await request(app).post('/api/todos').send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTodo.title);
      expect(response.body.completed).toBe(newTodo.completed);

      // Verify it was created in the database
      const created = await prisma.todo.findUnique({
        where: { id: response.body.id },
      });
      expect(created).not.toBeNull();
      expect(created?.title).toBe(newTodo.title);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app).post('/api/todos').send({
        completed: false,
      });

      expect(response.status).toBe(400);
    });

    it('should set completed to false by default', async () => {
      const response = await request(app).post('/api/todos').send({
        title: 'Todo without completed field',
      });

      expect(response.status).toBe(201);
      expect(response.body.completed).toBe(false);
    });

    it('should create todo with priority', async () => {
      const response = await request(app).post('/api/todos').send({
        title: 'High Priority Task',
        priority: 'HIGH',
      });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('HIGH');
    });

    it('should default priority to LOW', async () => {
      const response = await request(app).post('/api/todos').send({
        title: 'Default Priority Task',
      });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('LOW');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app).post('/api/todos').send({
        title: 'Invalid Priority Task',
        priority: 'URGENT',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a todo by id', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Test Todo', completed: false },
      });

      const response = await request(app).get(`/api/todos/${created.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(created.id);
      expect(response.body.title).toBe(created.title);
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app).get('/api/todos/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Original Title', completed: false },
      });

      const updates = {
        title: 'Updated Title',
        completed: true,
      };

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.completed).toBe(updates.completed);

      // Verify in database
      const updated = await prisma.todo.findUnique({
        where: { id: created.id },
      });
      expect(updated?.title).toBe(updates.title);
      expect(updated?.completed).toBe(updates.completed);
    });

    it('should return 404 when updating non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should allow partial updates', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Original Title', completed: false },
      });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original Title');
      expect(response.body.completed).toBe(true);
    });

    it('should update priority', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Task', completed: false, priority: 'LOW' },
      });

      const response = await request(app)
        .put(`/api/todos/${created.id}`)
        .send({ priority: 'CRITICAL' });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('CRITICAL');
    });

    it('should return priority in get all todos', async () => {
      await prisma.todo.create({
        data: { title: 'Task with priority', priority: 'HIGH' },
      });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('priority');
      expect(response.body[0].priority).toBe('HIGH');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const created = await prisma.todo.create({
        data: { title: 'To Be Deleted', completed: false },
      });

      const response = await request(app).delete(`/api/todos/${created.id}`);

      expect(response.status).toBe(204);

      // Verify it was deleted
      const deleted = await prisma.todo.findUnique({
        where: { id: created.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent todo', async () => {
      const response = await request(app).delete('/api/todos/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
