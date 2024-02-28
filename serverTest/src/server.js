const WebSocket = require('ws');

const socketPort = 5000;
const serverURL = "ws://localhost:" + socketPort + "/"
// const serverURL = "wss://ccapi.567437965.xyz/"

const ws = new WebSocket(serverURL);

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
