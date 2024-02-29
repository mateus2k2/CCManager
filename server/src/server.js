// index.js

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// const app = express();
// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app); // Create HTTP server
// const io = socketIo(server); // Attach socket.io to the HTTP server


// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

// Create tables if not exists
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME NOT NULL,
    body TEXT NOT NULL,
    isDone INTEGER DEFAULT 0
  )`, (err) => {
    if (err) {
      console.error('Error creating requests table:', err.message);
    } else {
      console.log('Requests table created successfully.');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    date DATETIME NOT NULL,
    body TEXT NOT NULL,
    FOREIGN KEY(request_id) REFERENCES requests(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating responses table:', err.message);
    } else {
      console.log('Responses table created successfully.');
    }
  });
}

// Endpoint to insert a new record into requests table
app.get('/getData', (req, res) => {
  const currentDate = new Date().toISOString();
  const requestBody = req.body;

  db.run(`INSERT INTO requests (date, body, isDone) VALUES (?, ?, ?)`, [currentDate, JSON.stringify(requestBody), 0], function(err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('New record inserted with ID:', this.lastID);
      res.status(200).json({ message: 'Data inserted successfully', id: this.lastID });
    }
  });
});

// Endpoint to get the oldest request that is not done
app.get('/getRequest', (req, res) => {
  db.get(`SELECT * FROM requests WHERE isDone = 0 ORDER BY date ASC LIMIT 1`, (err, row) => {
    if (err) {
      console.error('Error retrieving request:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (!row) {
        res.status(404).json({ message: 'No pending requests found' });
      } else {
        res.status(200).json(row);
      }
    }
  });
});

// Endpoint to make a response for a request
app.post('/makeResponse/:id', (req, res) => {
  const requestId = req.params.id;
  const currentDate = new Date().toISOString();
  const responseBody = req.body;

  // Check if the request with the given ID exists
  db.get(`SELECT * FROM requests WHERE id = ?`, [requestId], (err, row) => {
    if (err) {
      console.error('Error checking request:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      console.error('Request not found');
      return res.status(404).json({ error: 'Request not found' });
    }

    // If the request exists, proceed with inserting the response and marking the request as done
    db.serialize(() => {
      db.run(`INSERT INTO responses (request_id, date, body) VALUES (?, ?, ?)`, [requestId, currentDate, JSON.stringify(responseBody)], function(err) {
        if (err) {
          console.error('Error inserting response:', err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }

        console.log('New response inserted with ID:', this.lastID);

        db.run(`UPDATE requests SET isDone = 1 WHERE id = ?`, [requestId], (err) => {
          if (err) {
            console.error('Error updating request:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
          }

          console.log('Request marked as done with ID:', requestId);
          res.status(200).json({ message: 'Response created successfully and request marked as done' });
        });
      });
    });
  });
});


// Endpoint to poll for data until response appears
app.get('/getDataNow/:id', async (req, res) => {
  const requestId = req.params.id;

  // Polling interval (milliseconds)
  const pollingInterval = 1000;

  // Check if the request with the given ID exists
  db.get(`SELECT * FROM requests WHERE id = ?`, [requestId], async (err, row) => {
    if (err) {
      console.error('Error checking request:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      console.error('Request not found');
      return res.status(404).json({ error: 'Request not found' });
    }

    // If the request exists, start polling for the response
    const checkResponse = async () => {
      return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM responses WHERE request_id = ?`, [requestId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(row);
            } else {
              setTimeout(checkResponse, pollingInterval);
            }
          }
        });
      });
    };

    try {
      const response = await checkResponse();
      res.status(200).json(response);
    } catch (err) {
      console.error('Error polling for response:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});



// // WebSocket logic
// io.on('connection', (socket) => {
//   console.log('Client connected');

//   // Listen for client requests to subscribe to a particular request ID
//   socket.on('subscribeToRequest', (requestId) => {
//     // Start listening to changes in the responses table for the given request ID
//     const query = db.prepare(`SELECT * FROM responses WHERE request_id = ?`);
//     query.each(requestId, (err, row) => {
//       if (err) {
//         console.error('Error fetching response:', err.message);
//       } else {
//         // Send the response to the client
//         socket.emit('response', row);
//       }
//     });
//     query.finalize();
//   });

//   // Handle client disconnection
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
