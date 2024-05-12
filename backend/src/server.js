// --------------------------------------------------------------------
// IMPORTS
// --------------------------------------------------------------------

const express = require('express');
const { Pool, Client } = require('pg');

// --------------------------------------------------------------------
// DB CONFIG AND CONECTIONS
// --------------------------------------------------------------------

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

client.connect();

// --------------------------------------------------------------------
// EXPRESS CONFIGURATION
// --------------------------------------------------------------------

const app = express();

app.use(express.json());

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

// --------------------------------------------------------------------
// checkStatus
// --------------------------------------------------------------------


app.get('/status', async (req, res) => {
  res.status(200).send("OK")
});


// --------------------------------------------------------------------
// makeResponse
// --------------------------------------------------------------------

app.post('/makeResponse/:id', async (req, res) => {
  console.log(`Making Response: ${req.params.id}`)

  try {
    const requestId = req.params.id;
    const currentDate = new Date().toISOString();
    const responseBody = req.body;

    // console.log(responseBody)

    const request = await pool.query('SELECT * FROM requests WHERE id = $1 AND isDone = 0', [requestId]);
    if (request.rows.length === 0) {
      res.status(404).send(`Request with ID: ${requestId} Not Found`);
      return;
    }

    await pool.query(`INSERT INTO responses (request_id, date, body) VALUES ($1, $2, $3)`, [requestId, currentDate, JSON.stringify(responseBody)]);
    await pool.query('UPDATE requests SET isDone = 1 WHERE id = $1', [requestId]);

    await pool.query('NOTIFY response_added');
    
    res.status(201).send(`Sucess on response : ${requestId}`);
    console.log(`Response OK: ${req.params.id}`)

  } 
  catch (error) {
    console.error(`Error on response: ${requestId}`, error);
    res.status(500).send(`Error on response: ${requestId}`, error);
  }
});

// --------------------------------------------------------------------
// makeRequest
// --------------------------------------------------------------------

app.get('/makeRequest', async (req, res) => {
  console.log(`Making Request`);

  try {
    const currentDate = new Date().toISOString();
    const requestBody = req.body;

    const insertedRequest = await pool.query('INSERT INTO requests (date, body, isDone) VALUES ($1, $2, $3) RETURNING *', [currentDate, JSON.stringify(requestBody), 0]);
    const requestId = insertedRequest.rows[0].id;

    const notificationListener = async (msg) => {
      if (msg.channel === 'response_added') {
        const response = await pool.query('SELECT * FROM responses WHERE request_id = $1', [requestId]);
        if (response.rows.length > 0) {
          res.json(response.rows);
          client.removeListener('notification', notificationListener);
        }
      }
    };

    client.on('notification', notificationListener);
    await client.query('LISTEN response_added');

    console.log(`Request OK`);
  } catch (error) {
    console.error(`Error waiting for request: `, error);
    res.status(500).send(`Error waiting for request: `);
  }
});

// --------------------------------------------------------------------
// getOldestRequest
// --------------------------------------------------------------------

app.get('/getOldestRequest', async (req, res) => {
  // console.log(`Geting Oldest request`)
  
  try {
    const request = await pool.query('SELECT * FROM requests WHERE isDone = 0 ORDER BY date LIMIT 1');
    res.json(request['rows'][0]);
  }

  catch (error) {
    console.error('Error getting last request:', error);
    res.status(500).send('Error getting last request' );
  }

});

// --------------------------------------------------------------------
// Server
// --------------------------------------------------------------------

const PORT = 5015;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
