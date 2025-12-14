import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
};
