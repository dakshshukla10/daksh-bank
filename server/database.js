const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'daksh-bank.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function init() {
  const database = getDb();
  
  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL,
      name TEXT NOT NULL,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('add', 'deduct')),
      amount REAL NOT NULL,
      description TEXT,
      added_by TEXT NOT NULL,
      balance_after REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (added_by) REFERENCES users(id)
    )
  `);

  // Create index for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  `);

  // Insert initial users if they don't exist
  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (id, pin, name, balance) VALUES (?, ?, ?, ?)
  `);

  // Shared savings account (no login, just for tracking)
  insertUser.run('savings', '', 'Savings', 0);

  console.log('✅ Database initialized');
}

module.exports = {
  getDb,
  init
};
