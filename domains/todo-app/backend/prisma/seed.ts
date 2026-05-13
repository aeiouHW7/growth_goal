import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清空现有数据
  await prisma.todo.deleteMany();

  // 创建示例数据
  const todos = await prisma.todo.createMany({
    data: [
      {
        title: 'Learn React + TypeScript',
        completed: false,
      },
      {
        title: 'Build a TODO app',
        completed: true,
      },
      {
        title: 'Explore ACE Engine',
        completed: false,
      },
    ],
  });

  console.log(`✅ Seeded ${todos.count} todos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
