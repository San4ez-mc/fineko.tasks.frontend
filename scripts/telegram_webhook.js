/**
 * Simple Express server to receive Telegram webhook updates and log errors.
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, '..', 'telegram_messages.db');
const db = new sqlite3.Database(dbFile);

// Ensure table exists
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS telegram_messages_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payload TEXT,
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

const app = express();
app.use(express.json());

async function processUpdate(update) {
  // placeholder for actual business logic
}

app.post('/telegram/webhook', async (req, res) => {
  try {
    await processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    db.run(
      `INSERT INTO telegram_messages_log (payload, error) VALUES (?, ?)`,
      [JSON.stringify(req.body), err.stack],
      (dbErr) => {
        if (dbErr) {
          console.error('Failed to log Telegram webhook error:', dbErr);
        }
      }
    );
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Telegram webhook listening on port ${port}`);
});
