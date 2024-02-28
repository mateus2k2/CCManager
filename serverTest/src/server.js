const WebSocket = require('ws');

const ws = new WebSocket('ws://sockset.567437965.xyz');
// const ws = new WebSocket('ws://localhost:8586');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');

  // Send a message to the server
  ws.send('Hello from client');
});

ws.on('message', function incoming(message) {
  console.log('Received message from server:', message);
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

// Handle user input from the console
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Type a message to send to the server: ', (input) => {
  ws.send(input);
  rl.close();
});
