const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./queries');
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/messages', db.getMessages);
app.post('/messages', db.createMessage);
app.delete('/messages/:id', db.deleteMessage);
app.get('/messages/consume', db.consumeMessage);

app.listen(port, () => {
  console.log(`Broker app running on port ${port}.`);
});


//app.get('/users/:id', db.getUserById);
//app.put('/users/:id', db.updateUser);


// app.get('/', (req, res) => {
//   request('http://localhost:8081/', function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
//   });
//   return res.send('Received a GET HTTP method');
// });