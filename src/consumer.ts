import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { brokerUrl } from "./util/constants";
import { printAppInfo } from "./util/consoleUtil";

export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let port = optimist.argv.port || 7001;
const consumerUrl: string = `http://localhost:${port}`;

const consumeMessages = (req: express.Request, response: express.Response) => {
  request.get(`${brokerUrl}/messages/consume`, (error, resp, body) => {
    if (error) {
      console.error(error);
      return;
    }
    var readMessages = JSON.parse(body);
    console.log(`Consumed messages: \n${readMessages.join("\n")}`);
    response.status(200).json({ consumedMessages: readMessages });
  });
};

const subscribe = (req: express.Request, response: express.Response) => {
  const payload = {
    json: {
      consumer: consumerUrl
    }
  };
  request.post(`${brokerUrl}/messages/subscribe`, payload, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(body);
  });
  response.status(200).json(`Consumer with url=[${consumerUrl}] is successfully subscribed.`);
};

const unsubscribe = (req: express.Request, response: express.Response) => {
  const payload = {
    json: {
      consumer: consumerUrl
    }
  };
  request.post(`${brokerUrl}/messages/unsubscribe`, payload, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(body);
  });
  response.status(202).json(`Consumer with url=[${consumerUrl}] is successfully unsubscribed.`);
};

const receiveMessages = (request: express.Request, response: express.Response) => {
  const messages = request.body.messages;
  console.log(`Received messages: \n${messages.join("\n")}`);
  response.json({ info: "Successfully received messages." });
};

const index = (request: express.Request, response: express.Response) => {
  response.json("Consumer app");
};

app.get("/", index);
app.get("/consume", consumeMessages);
app.post("/receive", receiveMessages);
app.get("/subscribe", subscribe);
app.delete("/unsubscribe", unsubscribe);

app.listen(port, () => printAppInfo("CONSUMER", port));
