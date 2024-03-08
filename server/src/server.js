// Import required modules
const express = require('express');
const { Pool, Client } = require('pg');

// Create a PostgreSQL pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Create a PostgreSQL client for listening to notifications
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});
client.connect();

// Create Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Function to create tables if they don't exist
async function createTablesIfNotExist() {
  try {
    // Example table creation query
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        body TEXT NOT NULL,
        isDone INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS responses (
            id SERIAL PRIMARY KEY,
            request_id INTEGER NOT NULL,
            date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            body TEXT NOT NULL,
            FOREIGN KEY(request_id) REFERENCES requests(id)
      );
    `);

    console.log('Tables created successfully or already exist.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Create tables at server startup
createTablesIfNotExist();

// Endpoint to add a line to the table
app.post('/makeResponse/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentDate = new Date().toISOString();
    const responseBody = req.body;

    console.log('requestId:', requestId);

    // check if there is a request not done with the same id
    const request = await pool.query('SELECT * FROM requests WHERE id = $1 AND isDone = 0', [requestId]);
    if (request.rows.length === 0) {
      res.status(404).send('No pending requests found');
      return;
    }

    await pool.query(`INSERT INTO responses (request_id, date, body) VALUES ($1, $2, $3)`, [requestId, currentDate, JSON.stringify(responseBody)]);

    // Notify the 'response_added' channel
    await pool.query('NOTIFY response_added');
    
    res.status(201).send('Line added successfully');
  } catch (error) {
    console.error('Error adding line:', error);
    res.status(500).send('Error adding line');
  }
});

// Endpoint to wait for a specific line in the table
app.get('/makeRequest', async (req, res) => {
  try {
    const currentDate = new Date().toISOString();
    const requestBody = req.body;

    const insertedRequest = await pool.query('INSERT INTO requests (date, body, isDone) VALUES ($1, $2, $3 ) RETURNING *', [currentDate, JSON.stringify(requestBody), 0]);
    const requestID = insertedRequest.rows[0].id;

    // Listen for notifications on 'response_added' channel
    client.on('notification', async (msg) => {
      if (msg.channel === 'response_added') {
        const response = await pool.query('SELECT * FROM responses WHERE request_id = $1', [requestID]);
        if (response.rows.length > 0) {
          res.json(response.rows);
          client.end();
        }
      }
    });

    // Start listening
    await client.query('LISTEN response_added');

  } catch (error) {
    console.error('Error waiting for line:', error);
    res.status(500).send('Error waiting for line');
  }
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
