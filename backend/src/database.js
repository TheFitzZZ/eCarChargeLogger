const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/meter_tracker.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meter_id INTEGER NOT NULL,
    value REAL NOT NULL,
    price REAL NOT NULL,
    delta REAL,
    cost REAL,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_readings_meter_id ON readings(meter_id);
  CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp);
`);

// Insert default meter if none exists
const meterCount = db.prepare('SELECT COUNT(*) as count FROM meters').get();
if (meterCount.count === 0) {
  db.prepare('INSERT INTO meters (name) VALUES (?)').run('Main Meter');
}

module.exports = db;
