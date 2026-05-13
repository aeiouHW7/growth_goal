import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';
import logger from '../utils/logger';

/**
 * 缓存中间件
 * @param ttl 缓存时间（秒），默认 60 秒
 */
export const cacheMiddleware = (ttl: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug(`Cache hit: ${key}`);
      return res.json(cachedResponse);
    }

    // 保存原始 json 方法
    const originalJson = res.json.bind(res);

    // 重写 json 方法，缓存响应
    res.json = function (body: any) {
      // 只缓存成功的响应
      if (res.statusCode === 200) {
        cache.set(key, body, ttl);
        logger.debug(`Cache miss, stored: ${key}`);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * 清除缓存
 * @param pattern 匹配模式（支持通配符）
 */
export const clearCache = (pattern?: string) => {
  if (!pattern) {
    cache.flushAll();
    logger.info('All cache cleared');
    return;
  }

  const keys = cache.keys();
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));

  keys.forEach((key) => {
    if (regex.test(key)) {
      cache.del(key);
      logger.debug(`Cache cleared: ${key}`);
    }
  });
};
