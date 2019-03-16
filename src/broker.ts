import express from "express";
import request from "request";
import _ from "lodash";

const app = express();
const bodyParser = require("body-parser");
const consoleUtil = require("./consoleUtil");
const db = require("./queries");
const port = require("optimist").argv.port;

var publishers: Array<Publisher> = [];
var consumers: Array<Consumer> = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    console.log(consumers);
    response.json({
      info: `Consumer with url: ${consumerUrl} successfully unsubscribed.`
    });
  }
);

app.get("/messages", db.getMessages);
app.get("/messages/consume", db.consumeMessage);
app.post("/messages", db.createMessage);
app.delete("/messages/:id", db.deleteMessage);

app.get("/", (request: express.Request, response: express.Response) => {
  response.json({
    info:
      "Message broker application written in Node.js, Express, and PostgreSQL."
  });
});

app.listen(port, consoleUtil.printAppInfo("BROKER", port));
