import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

// Get the user data path to store the SQLite database
const userDataPath = app.getPath('userData');
export const dbPath = join(userDataPath, 'medilog.sqlite');

// Initialize better-sqlite3
export const sqlite = new Database(dbPath);

// Enforce foreign keys for data integrity
sqlite.pragma('foreign_keys = ON');
// Use WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Initialize Drizzle ORM
export const db = drizzle(sqlite);

// Run migrations automatically at startup.
// In both dev (electron-vite) and prod, __dirname = out/main/
// Migrations are copied to out/main/db/migrations by the Vite copy plugin.
const migrationsFolder = join(__dirname, 'db/migrations');
migrate(db, { migrationsFolder });
