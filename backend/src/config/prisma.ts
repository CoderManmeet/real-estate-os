import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = global.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}