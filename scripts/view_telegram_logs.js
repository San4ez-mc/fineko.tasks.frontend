/**
 * CLI to view Telegram webhook error logs.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, '..', 'telegram_messages.db');
const db = new sqlite3.Database(dbFile);

db.all(
  `SELECT id, payload, error, created_at FROM telegram_messages_log ORDER BY id DESC`,
  (err, rows) => {
    if (err) {
      console.error('Failed to read log:', err);
      process.exit(1);
    }
    if (!rows.length) {
      console.log('No logged errors found.');
      return;
    }
    rows.forEach((row) => {
      console.log(`#${row.id} - ${row.created_at}\nPayload: ${row.payload}\nError: ${row.error}\n`);
    });
  }
);
