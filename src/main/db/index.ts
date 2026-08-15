import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

// Get the user data path to store the SQLite database
const userDataPath = app.getPath('userData');
const dbPath = join(userDataPath, 'medilog.sqlite');

// Initialize better-sqlite3
const sqlite = new Database(dbPath);

// Enforce foreign keys for data integrity
sqlite.pragma('foreign_keys = ON');
// Use WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Initialize Drizzle ORM
export const db = drizzle(sqlite);
