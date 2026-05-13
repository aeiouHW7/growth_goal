import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

// 记录服务启动时间
const startTime = Date.now();

/**
 * GET /health
 * 健康检查端点
 * 返回系统状态、数据库连接状态、服务运行时间
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // 检查数据库连接
    let databaseStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      databaseStatus = 'disconnected';
      console.error('Database health check failed:', dbError);

      return res.status(503).json({
        success: false,
        error: 'Database unavailable'
      });
    }

    // 计算服务运行时间（秒）
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    // 返回健康状态
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        database: databaseStatus,
        uptime: uptime
      }
    });
  } catch (error) {
    console.error('Health check error:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;
