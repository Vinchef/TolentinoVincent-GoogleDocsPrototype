import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const vincent = await prisma.user.upsert({
    where: { email: 'vincent@example.com' },
    update: {},
    create: {
      name: 'Vincent',
      email: 'vincent@example.com',
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      name: 'Alex',
      email: 'alex@example.com',
    },
  });

  console.log('Seeded users:', { vincent, alex });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
