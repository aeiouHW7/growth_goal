import { Router } from 'express';
import { todoController } from '../controllers/todoController';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// GET 请求启用缓存（60 秒）
router.get('/todos', cacheMiddleware(60), todoController.getAll);
router.post('/todos', todoController.create);
router.get('/todos/:id', cacheMiddleware(60), todoController.getById);
router.put('/todos/:id', todoController.update);
router.delete('/todos/:id', todoController.delete);

export default router;
