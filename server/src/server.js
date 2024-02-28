const WebSocket = require('ws');
const readline = require('readline');

const port = 5020;
// const port = 8586;
const wss = new WebSocket.Server({ port: port });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received message from client:', message);
    
    ws.send('Echo from server: ' + message);
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on port', port);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('Type a message to send to clients: ');

rl.on('line', function (input) {
  wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(input);
    }
  });
});

rl.prompt();




// const express = require('express');

// const app = express();

// app.get('/api', (req, res) => {
//   res.json({ "users": ["user1", "user2", "user3"]});
// });

// app.listen(5000, () => { 
//   console.log('Server running on port 5000');
// });