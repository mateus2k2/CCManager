// //esse servidor http seria aberto para internet
// //esse codigo vai receber os requests http e mandar pro server em lua via o socket 
// //o server em lua recebe as informações e manda as respostas
// //esse codigo pega essas respostas e manda de volta como respota da request

// const WebSocket = require('ws');
// const readline = require('readline');

// const port = 8585;
// const wss = new WebSocket.Server({ port: port });

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

// console.log('WebSocket server running on port', port);

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


const express = require('express');

const app = express();

// app.use(function(req, res, next) {
//   if(req.headers['x-forwarded-proto']==='http') {
//     return res.redirect('https://' + req.headers.host + req.url);
//   }
//   next();
// });

app.get('/api', (req, res) => {
  res.json({ "users": ["user1", "user2", "user3"]});
});

app.listen(5000, () => { 
  console.log('Server running on port 5000');
});