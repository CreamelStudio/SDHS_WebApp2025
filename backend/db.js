const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "community.db"));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userNum TEXT NOT NULL,
      userName TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      user TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
