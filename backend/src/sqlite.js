// --------------------------------------------------------------------
// IMPORTS
// --------------------------------------------------------------------

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// --------------------------------------------------------------------
// DB CONFIG AND CONNECTION
// --------------------------------------------------------------------

async function initializeDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      body TEXT NOT NULL,
      isDone INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      body TEXT NOT NULL,
      FOREIGN KEY(request_id) REFERENCES requests(id)
    );
  `);

  return db;
}

const dbPromise = initializeDb();

// --------------------------------------------------------------------
// EXPRESS CONFIGURATION
// --------------------------------------------------------------------

const app = express();

app.use(express.json());

// --------------------------------------------------------------------
// checkStatus
// --------------------------------------------------------------------

app.get('/status', async (req, res) => {
  res.status(200).send("OK");
});

// --------------------------------------------------------------------
// makeResponse
// --------------------------------------------------------------------

app.post('/makeResponse/:id', async (req, res) => {
  console.log(`Making Response: ${req.params.id}`);

  try {
    const db = await dbPromise;
    const requestId = req.params.id;
    const currentDate = new Date().toISOString();
    const responseBody = req.body;

    const request = await db.get('SELECT * FROM requests WHERE id = ? AND isDone = 0', [requestId]);
    if (!request) {
      res.status(404).send(`Request with ID: ${requestId} Not Found`);
      return;
    }

    await db.run(`INSERT INTO responses (request_id, date, body) VALUES (?, ?, ?)`, [requestId, currentDate, JSON.stringify(responseBody)]);
    await db.run('UPDATE requests SET isDone = 1 WHERE id = ?', [requestId]);

    res.status(201).send(`Success on response : ${requestId}`);
    console.log(`Response OK: ${req.params.id}`);
  } catch (error) {
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
    const db = await dbPromise;
    const currentDate = new Date().toISOString();
    const requestBody = req.body;

    const result = await db.run('INSERT INTO requests (date, body, isDone) VALUES (?, ?, ?)', [currentDate, JSON.stringify(requestBody), 0]);
    const requestId = result.lastID;

    const checkResponse = async (requestId, timeout = 30000, interval = 1000) => {
      const startTime = Date.now();
      while ((Date.now() - startTime) < timeout) {
        const response = await db.get('SELECT * FROM responses WHERE request_id = ?', [requestId]);
        if (response) {
          response.body = JSON.parse(response.body); // Parse the JSON string before sending the response
          return response;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      throw new Error('Timeout waiting for response');
    };

    try {
      const response = await checkResponse(requestId);
      res.json(response);
      console.log(`Request OK and response received: ${requestId}`);
    } catch (error) {
      res.status(504).send('Timeout waiting for response');
      console.error('Timeout waiting for response', error);
    }
  } catch (error) {
    console.error(`Error making request: `, error);
    res.status(500).send(`Error making request: `);
  }
});

// --------------------------------------------------------------------
// getOldestRequest
// --------------------------------------------------------------------

app.get('/getOldestRequest', async (req, res) => {
  try {
    const db = await dbPromise;
    const request = await db.get('SELECT * FROM requests WHERE isDone = 0 ORDER BY date LIMIT 1');
    if (request) {
      request.body = JSON.parse(request.body); // Parse the JSON string before sending the response
    }
    res.json(request);
  } catch (error) {
    console.error('Error getting last request:', error);
    res.status(500).send('Error getting last request');
  }
});

// --------------------------------------------------------------------
// Server
// --------------------------------------------------------------------

const PORT = 5015;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
