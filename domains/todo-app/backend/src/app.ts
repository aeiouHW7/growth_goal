import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(requestLogger); // 请求日志

// 路由
app.use('/api', todoRoutes);
app.use('/api', healthRoutes);

// 错误处理
app.use(errorHandler);

export default app;
