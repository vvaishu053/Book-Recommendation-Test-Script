const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Use DB_PATH if provided (Docker/integration tests), else fallback to current path
const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../../database/bookstore.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    // avoid noisy logs during tests
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to SQLite database:", dbPath);
    }
    db.run("PRAGMA foreign_keys = ON");
  }
});

// Promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { db, dbRun, dbGet, dbAll };
