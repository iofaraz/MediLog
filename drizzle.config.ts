import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/main/db/schema/*',
  out: './src/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db', // Placeholder for Drizzle Kit (usually not needed for direct queries with better-sqlite3)
  },
  verbose: true,
  strict: true,
});
