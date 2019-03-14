import express from "express";
import _ from "lodash";

const bodyParser = require("body-parser");
const db = require("./queries");
const app = express();
const port = 3000;

var publishers: Array<Object> = [];

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get("/", (request: express.Request, response: express.Response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get(
  "/messages/subscribe",
  (request: express.Request, response: express.Response) => {
    publishers.push({
      publisher: "first publisher"
    });
    console.log(publishers);
    response.json({ info: "Publisher added." });
  }
);

app.delete(
  "/messages/subscribe",
  (request: express.Request, response: express.Response) => {
    publishers = _.dropRight(publishers);
    console.log(publishers);
    response.json({ info: "Publisher removed." });
  }
);

app.get("/messages", db.getMessages);
app.post("/messages", db.createMessage);
app.delete("/messages/:id", db.deleteMessage);
app.get("/messages/consume", db.consumeMessage);

app.listen(port, () => {
  console.log(`Broker app running on port ${port}.`);
});
