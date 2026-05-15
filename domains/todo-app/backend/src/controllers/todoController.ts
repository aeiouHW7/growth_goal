import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { clearCache } from '../middleware/cache';

const prisma = new PrismaClient();

export const todoController = {
  // GET /api/todos - 获取所有待办事项
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todos = await prisma.todo.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.json(todos);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/todos - 创建待办事项
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title } = req.body;

      // 验证
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required and must be a string' });
      }

      if (title.trim().length === 0 || title.length > 200) {
        return res.status(400).json({ error: 'Title must be 1-200 characters' });
      }

      // 创建
      const todo = await prisma.todo.create({
        data: {
          title: title.trim(),
        },
      });

      // 清除列表缓存
      clearCache('cache:/api/todos$');

      res.status(201).json(todo);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/todos/:id - 获取单个待办事项
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      // BUG: id 为 NaN 时不会触发 400，而是查数据库后抛异常
      const todo = await prisma.todo.findUnique({
        where: { id: parsedId },
      });

      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json(todo);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/todos/:id - 更新待办事项
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, completed, priority } = req.body;

      // 验证
      if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 200)) {
        return res.status(400).json({ error: 'Title must be 1-200 characters' });
      }

      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
      }

      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (priority !== undefined && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL' });
      }

      // 更新
      const data: any = {};
      if (title !== undefined) data.title = title.trim();
      if (completed !== undefined) data.completed = completed;
      if (priority !== undefined) data.priority = priority;

      const todo = await prisma.todo.update({
        where: { id: parseInt(id) },
        data,
      });

      // 清除相关缓存
      clearCache('cache:/api/todos');

      res.json(todo);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Todo not found' });
      }
      next(error);
    }
  },

  // DELETE /api/todos/:id - 删除待办事项
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await prisma.todo.delete({
        where: { id: parseInt(id) },
      });

      // 清除相关缓存
      clearCache('cache:/api/todos');

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Todo not found' });
      }
      next(error);
    }
  },
};
