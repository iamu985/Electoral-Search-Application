const sqlite3 = require('sqlite3').verbose();

// Connect to a database stored in the file 'mydb.db'
let db = new sqlite3.Database('./database/data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error when creating the database', err);
  } else {
    console.log('Database created!');
    // You can now run any SQL commands you need
    createTable(db);
  }
});

function createTable(db) {
  // SQL string to create a table
  const sqlCreateTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )`;

  // Run the SQL to create the table
  db.run(sqlCreateTable, (err) => {
    if (err) {
      console.error('Error creating table', err);
    } else {
      console.log('Table created');
    }
  });
}
