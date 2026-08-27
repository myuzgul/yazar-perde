import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:.')) {
    return process.env.DATABASE_URL;
  }
  
  // 1. Try prisma/dev.db
  const prismaDb = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(prismaDb)) {
    return `file:${prismaDb}`;
  }
  
  // 2. Try root dev.db
  const rootDb = path.join(process.cwd(), 'dev.db');
  if (fs.existsSync(rootDb)) {
    return `file:${rootDb}`;
  }

  // 3. Fallback
  return `file:${prismaDb}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;