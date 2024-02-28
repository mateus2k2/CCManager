const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

let channel;

amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, ch) => {
    if (error1) {
      throw error1;
    }
    channel = ch;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
});

app.get('/getData', (req, res) => {
  if (!channel) {
    return res.status(500).send('RabbitMQ channel is not ready yet');
  }

  // const message = req.body.message;
  const message = "TESTE REQUEST";
  console.log(req.body)

  channel.assertQueue('requests', { durable: false });
  channel.sendToQueue('requests', Buffer.from(message));
  console.log(`Sent message to RabbitMQ: ${message}`);
  res.send('Message sent to RabbitMQ');
});

app.get('/getRequest', (req, res) => {
  if (!channel) {
    return res.status(500).send('RabbitMQ channel is not ready yet');
  }

  channel.assertQueue('requests', { durable: false });
  channel.consume('requests', (message) => {
    if (message !== null) {
      console.log(`Received message from RabbitMQ: ${message.content.toString()}`);
      channel.ack(message);
      res.json({ message: message.content.toString() });
    } else {
      res.status(404).json({ error: 'No messages available' });
    }
  });

app.get('/setResponse', (req, res) => {
  if (!channel) {
    return res.status(500).send('RabbitMQ channel is not ready yet');
  }

  // const message = req.body.message;
  const message = "TESTE RESPONSE";
  console.log(message)

  channel.assertQueue('responses', { durable: false });
  channel.sendToQueue('responses', Buffer.from(message));
  console.log(`Sent message to RabbitMQ: ${message}`);
  res.send('Message sent to RabbitMQ');
  });

});
