// Prisma configuration
// Environment variables are automatically loaded by Next.js
// This file is kept for potential future configuration needs

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
};
