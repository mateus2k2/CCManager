// const WebSocket = require('ws');
// const readline = require('readline');

// const socketPort = 5000;
// const wss = new WebSocket.Server({ port: socketPort });

// wss.on('connection', function connection(ws) {
//   console.log('Client connected');

//   ws.on('message', function incoming(message) {
//     console.log('Received message from client:', message);
    
//     ws.send('Echo from server: ' + message);
//   });

//   ws.on('close', function close() {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server running on port', socketPort);

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.setPrompt('Type a message to send to clients: ');

// rl.on('line', function (input) {
//   wss.clients.forEach(function (client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(input);
//     }
//   });
// });

// rl.prompt();




// const express = require('express');

// const app = express();

// app.get('/api', (req, res) => {
//   res.json({ "users": ["user1", "user2", "user3"]});
// });

// app.listen(5000, () => { 
//   console.log('Server running on port 5000');
// });



// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 5000 }); // Create WebSocket server on port 8080

// let isClientConnected = false; // Flag to track if a client is already connected

// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   if (isClientConnected) {
//     // If a client is already connected, reject new connection
//     ws.close(1000, 'Only one connection allowed');
//     return;
//   }

//   ws.on('message', (message) => {
//     if (message === '123456789') {
//       // If the received message is the authentication token, allow the connection
//       isClientConnected = true;
//       ws.send('Authentication successful. You are connected.');
//     } else {
//       // If the received message is not the authentication token, close the connection
//       ws.close(1000, 'Authentication failed. Closing connection.');
//     }
//   });

//   ws.on('close', () => {
//     isClientConnected = false; // Reset the connection flag when the client disconnects
//   });
// });

// console.log('WebSocket server running on port 5000');









const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let isClientConnected = false; // Flag to track if a client is already connected

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  if (isClientConnected) {
    // If a client is already connected, reject new connection
    ws.close(1000, 'Only one connection allowed');
    return;
  }

  ws.on('message', (message) => {
    if (message === '123456789') {
      // If the received message is the authentication token, allow the connection
      isClientConnected = true;
      ws.send('Authentication successful. You are connected.');
    } else {
      // If the received message is not the authentication token, close the connection
      ws.close(1000, 'Authentication failed. Closing connection.');
    }
  });

  ws.on('close', () => {
    isClientConnected = false; // Reset the connection flag when the client disconnects
  });
});

app.get('/api', (req, res) => {
  res.send('API endpoint');
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
