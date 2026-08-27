import { PrismaClient } from '@prisma/client';
import path from 'path';

// SQLite veritabanı dosyasının mutlak yolunu garanti et
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;