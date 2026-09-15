import { PrismaClient } from '@prisma/client';
import path from 'path';

if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(process.cwd(), 'server', 'prisma', 'dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const prisma = new PrismaClient();

export default prisma;
