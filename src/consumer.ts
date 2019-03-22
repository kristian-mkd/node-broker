import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { brokerUrl } from "./util/constants";
import { printAppInfo } from "./util/consoleUtil";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = optimist.argv.port;
const consumerUrl: string = `http://localhost:${port}`;

const consumeMessages = (req: express.Request, response: express.Response) => {
  request.get(`${brokerUrl}/messages/consume`, (error, resp, body) => {
    if (error) {
      console.error(error);
      return;
    }
    var readMessages = JSON.parse(body);
    console.log(readMessages);
    readMessages.messages = _.map(readMessages.messages, (message: Message) => message.content);
    response.status(200).json(readMessages);
  });
};

const subscribe = (req: express.Request, response: express.Response) => {
  const payload = { json: { url: consumerUrl } };
  request.post(`${brokerUrl}/messages/subscribe`, payload, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(body);
  });
  response.send(`Consumer with url: ${consumerUrl} is successfully subscribed`);
};

const unsubscribe = (req: express.Request, response: express.Response) => {
  request.post(
    `${brokerUrl}/messages/unsubscribe`,
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
  response.send(`Consumer with url: ${consumerUrl} is successfully unsubscribed`);
};

const receiveMessages = (request: express.Request, response: express.Response) => {
  const receivedMessages = JSON.stringify(request.body);
  console.log(`Received messages: ${receivedMessages}`);
  response.json({ info: "Successfully received messages" });
};

app.get("/subscribe", subscribe);
app.delete("/unsubscribe", unsubscribe);
app.get("/consume", consumeMessages);
app.post("/receive", receiveMessages);

app.get("/", (request, response) => {
  response.json({ info: "Consumer app" });
});

app.listen(port, () => printAppInfo("CONSUMER", port));
