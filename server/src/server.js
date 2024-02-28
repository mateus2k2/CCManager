// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// let connectedClient = null;

// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   if (connectedClient) {
//     ws.close(1000, 'Only one connection allowed');
//     return;
//   }

//   ws.on('message', (message) => {
//     const receivedMessage = message.toString();

//     console.log('Received message from client:', receivedMessage);

//     if (receivedMessage === '123456789') {
//       connectedClient = ws;
//       console.log('Client authenticated');
//       ws.send('Authenticated');
//     } else {
//       ws.close(1000, 'Closing');
//     }
//   });

//   // ws.on('close', () => {
//   //   console.log('Client disconnected');
//   //   connectedClient = null;
//   // });
// });

// app.get('/api', async (req, res) => {
//   console.log('API request received');
//   console.log('Connected client:', connectedClient);
//   if (!connectedClient) {
//     res.status(500).send('No client connected');
//     return;
//   }

//   try {
//     console.log('energy');
//     connectedClient.send('energy');

//     const responsePromise = new Promise((resolve, reject) => {
//       connectedClient.once('message', (message) => {
//         resolve(message.toString());
//       });
//     });

//     const response = await responsePromise;

//     res.send('Response from client: ' + response);
//   } catch (error) {
//     res.status(500).send('Error communicating with client');
//   }
//   // return res.send('API is working');
// });

// server.listen(5000, () => {
//   console.log('Server running on port 5000');
// });





// if I hava a aplication in node js express 

// it has an endpoin called getData, this end point neads to put this data request in a Queeu with an ID

// then there is another aplication in a nother lamguage there is going to keep checking the queeu for requests and then put the responses and another place

// the endpoint getData need to wait for the response for the request with the respective ID to show up and the return that response

// the getData end point should wait for the reponse to apear for a set amount of time then if that times runs out it return an error

const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');

const app = express();
app.use(bodyParser.json());

// Connect to RabbitMQ
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = 'requests';
    channel.assertQueue(queue, { durable: false });

    // Endpoint to get requests from the queue
    app.get('/getRequests', (req, res) => {
      channel.consume(queue, function(msg) {
        const requestData = JSON.parse(msg.content.toString());
        res.json(requestData);
      }, { noAck: true });
    });

    // Endpoint to put response into the queue
    app.put('/putResponse/:requestId', (req, res) => {
      const requestId = req.params.requestId;
      const responseData = req.body;

      channel.assertQueue(queue + requestId, { durable: false });
      channel.sendToQueue(queue + requestId, Buffer.from(JSON.stringify(responseData)));

      res.json({ message: 'Response added to the queue' });
    });

    // Endpoint to handle data requests
    app.get('/getData', (req, res) => {
      const requestId = generateUniqueId(); // Implement your own ID generation logic

      // Put request data into the queue
      channel.sendToQueue(queue, Buffer.from(JSON.stringify({ requestId, requestData: req.query })));

      // Wait for response
      channel.consume(queue + requestId, function(msg) {
        const responseData = JSON.parse(msg.content.toString());
        res.json(responseData);
      }, { noAck: true });

      // Set timeout
      setTimeout(() => {
        res.status(500).json({ error: 'Timeout waiting for response' });
      }, 5000); // Set timeout to 5 seconds
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Helper function to generate unique IDs
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
