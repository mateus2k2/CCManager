// sudo docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres


// Import required modules
const express = require('express');
const { Pool } = require('pg');

// Create a PostgreSQL pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Create Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Function to create tables if they don't exist
async function createTablesIfNotExist() {
  try {
    // Example table creation query
    await pool.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        body VARCHAR(255)
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
app.post('/addLine', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('INSERT INTO responses (body) VALUES ($1)', [data]);
    res.status(201).send('Line added successfully');
  } catch (error) {
    console.error('Error adding line:', error);
    res.status(500).send('Error adding line');
  }
});

// Endpoint to wait for a specific line in the table
app.get('/waitForLine/:specificLine', async (req, res) => {
  try {
    const { specificLine } = req.params;
    let lineFound = false;

    // Loop until the specific line appears in the table
    while (!lineFound) {
      const result = await pool.query('SELECT * FROM responses WHERE body = $1', [specificLine]);
      console.log('result:', result.rows)
      if (result.rows.length > 0) {
        lineFound = true;
        res.json(result.rows);
      } else {
        // Wait for 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
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
