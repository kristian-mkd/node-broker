import express from "express";
import _ from "lodash";

const bodyParser = require("body-parser");
const db = require("./queries");
const app = express();
const port = require('optimist').argv.port;

var publishers: Array<Publisher> = [];
var consumers: Array<Consumer> = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request: express.Request, response: express.Response) => {
  response.json({
    info:
      "Message broker application written in Node.js, Express, and PostgreSQL."
  });
});

app.post(
  "/messages/subscribe",
  (request: express.Request, response: express.Response) => {
    const consumer = request.body;
    consumers.push(consumer);
    console.log(consumers);
    response.json({
      info: `Consumer with url: ${consumer.url} successfully subscribed.`
    });
  }
);

app.post(
  "/messages/unsubscribe",
  (request: express.Request, response: express.Response) => {
    const consumerUrl = request.body.url;
    consumers = _.filter(consumers, consumer => consumer.url !== consumerUrl);
    response.json({
      info: `Consumer with url: ${consumerUrl} successfully unsubscribed.`
    });
  }
);

app.get("/messages", db.getMessages);
app.post("/messages", db.createMessage);
app.delete("/messages/:id", db.deleteMessage);
app.get("/messages/consume", db.consumeMessage);

app.listen(port, () => {
  console.log(`Broker app running on port ${port}.`);
});
