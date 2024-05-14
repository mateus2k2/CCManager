// create-tables.js

const { pool, client, report } = require('./db');

async function createTablesIfNotExist() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        body JSONB NOT NULL,
        isDone INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        body JSONB NOT NULL,
        FOREIGN KEY(request_id) REFERENCES requests(id)
      );
    `);

    console.log('Tables created successfully or already exist.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTablesIfNotExist();

module.exports = createTablesIfNotExist;
