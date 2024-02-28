const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');
const axios = require('axios');

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

    const exchange = 'requests_exchange';
    const queue = 'requests';

    // Assert exchange and queue
    channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.assertQueue(queue, { durable: false });
    channel.bindQueue(queue, exchange, '');

    // Endpoint to get requests from the queue
    app.get('/getRequest', (req, res) => {
      // Get the last request from the queue
      channel.get(queue, { noAck: true }, function(err, msg) {
        if (err) {
          throw err;
        }
        if (msg !== false) {
          const requestData = JSON.parse(msg.content.toString());
          res.json({ requestData });
        } else {
          res.status(404).json({ message: 'No requests in the queue' });
        }
      });
    });

    // Endpoint to put response into the queue
    app.put('/putResponse/:requestId', (req, res) => {
      const requestId = req.params.requestId;
      const responseData = req.body;

      channel.sendToQueue(queue, Buffer.from(JSON.stringify({ requestId, responseData })));

      res.json({ message: 'Response added to the queue' });
    });

    // Endpoint to handle data requests
    app.get('/getData', (req, res) => {
      const requestId = generateUniqueId(); // Implement your own ID generation logic

      // Put request data into the queue
      channel.publish(exchange, '', Buffer.from(JSON.stringify({ requestId, requestData: req.query })));

      // Wait for response
      channel.consume(queue, function(msg) {
        const { requestId: msgRequestId, responseData } = JSON.parse(msg.content.toString());
        if (msgRequestId === requestId) {
          res.json(responseData);
        }
      }, { noAck: true });

      // Set timeout
      setTimeout(() => {
        res.status(500).json({ error: 'Timeout waiting for response' });
      }, 5000); // Set timeout to 5 seconds
    });
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

// Helper function to generate unique IDs
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
