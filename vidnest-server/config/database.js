import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`, { duration: `${e.duration}ms` });
  });
}

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', { message: e.message });
});

// Test connection
async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to Neon PostgreSQL database');
  } catch (error) {
    logger.error('❌ Database connection failed', { error: error.message });
    process.exit(1);
  }
}

export { prisma, connectDB };
