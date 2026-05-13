import { PrismaClient } from '@prisma/client';

// 创建 Prisma 单例实例
// 避免在热重载时创建多个数据库连接
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
