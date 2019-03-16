import request from "request";
import express from "express";

const app = express();
const bodyParser = require("body-parser");
const consoleUtil = require("./consoleUtil");
const port = require("optimist").argv.port;

const brokerUrl: string = "http://localhost:3000/messages";
const consumerUrl: string = `http://localhost:${port}/messages`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const consumeMessage = (req: express.Request, response: express.Response) => {
  //const { content } = req.body;

  request.get(`${brokerUrl}/consume`, (error, resp, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(`statusCode: ${resp.statusCode}`);
    console.log(body);
    response.status(200).json(body);
  });
  //return response.send("Consumed message:" + response.json);//('Consumed message ' + response.body);
};

const subscribe = (req: express.Request, response: express.Response) => {
  request.post(
    `${brokerUrl}/subscribe`,
    {
      json: {
        url: consumerUrl
      }
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(body);
    }
  );
  response.send(`Consumer with url: ${consumerUrl} is successfully subscribed`);
};

const unsubscribe = (req: express.Request, response: express.Response) => {
  request.post(
    `${brokerUrl}/unsubscribe`,
    {
      json: {
        url: consumerUrl
      }
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(body);
    }
  );
  response.send(
    `Consumer with url: ${consumerUrl} is successfully unsubscribed`
  );
};

app.get("/subscribe", subscribe);
app.delete("/unsubscribe", unsubscribe);
app.get("/consume", consumeMessage);
app.get("/", (request, response) => {
  response.json({ info: "Consumer app" });
});

app.listen(port, consoleUtil.printAppInfo("CONSUMER", port));
