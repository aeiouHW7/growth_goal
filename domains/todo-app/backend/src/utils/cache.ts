import NodeCache from 'node-cache';
import logger from './logger';

// 缓存配置
// stdTTL: 默认过期时间（秒）
// checkperiod: 检查过期缓存的周期（秒）
const cache = new NodeCache({
  stdTTL: 60, // 默认缓存 60 秒
  checkperiod: 120, // 每 120 秒检查一次过期缓存
  useClones: false, // 不克隆数据，提升性能
});

// 缓存事件监听
cache.on('set', (key, value) => {
  logger.debug(`Cache set: ${key}`);
});

cache.on('del', (key) => {
  logger.debug(`Cache deleted: ${key}`);
});

cache.on('expired', (key) => {
  logger.debug(`Cache expired: ${key}`);
});

export default cache;
