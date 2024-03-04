// index.js

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON requests
app.use(bodyParser.json());

const requests = [];
const responses = [];

// Endpoint to insert a new record into requests table
app.get('/getData/:id', (req, res) => {
  const { id } = req.params;

  requests.push({ id, date: new Date(), body: 'some data', isDone: false });

  let response = null;
  let found = false;
  while (!found) {
    response = responses.find((response) => response.id === id);
    console.log('response:', response);
    if (response) {
      found = true;
    } else {
      setTimeout(() => {}, 1000);
    }
  }
  res.json(response);

  // console.log('requests:', requests);
  // res.sendStatus(200)

});

// Endpoint to get the oldest request that is not done
app.get('/getRequest', (req, res) => {
  const request = requests.find((request) => !request.isDone);
  if (request) {
    res.json(request);
  } else {
    res.status(404).send('No request found');
  }
  
});

// Endpoint to make a response for a request
app.post('/makeResponse/:id', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  //find the request in the requests array
  const request = requests.find((request) => request.id === id);
  console.log(requests);
  if (request) {
    //add the response to the responses array
    responses.push({ id, date: new Date(), body: data });
    //mark the request as done
    request.isDone = true;
    res.status(200).send('Response added successfully');
  } 
  else {
    res.status(404).send('Request not found');
  }

});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

