import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { checkDbConnection, Message } from "./data/messageRepository";
import { printAppInfo } from "./util/consoleUtil";

const app = express();
const port = optimist.argv.port;
var consumers: Array<Consumer> = [];

const subscribe = (request: express.Request, response: express.Response) => {
  const consumer = request.body;
  consumers.push(consumer);
  response.json({
    info: `Consumer with url: ${consumer.url} successfully subscribed.`
  });
};

const unsubscribe = (request: express.Request, response: express.Response) => {
  const consumerUrl = request.body.url;
  consumers = _.filter(consumers, consumer => consumer.url !== consumerUrl);
  console.log(consumers);
  response.json({
    info: `Consumer with url: ${consumerUrl} successfully unsubscribed.`
  });
};

const publish = (request: express.Request, response: express.Response) => {
  Message.findAll()
    .then((messages: any) => {
      messages = _.map(messages, m => m.dataValues.content);
      sendToAllConsumers(messages);
    })
    .then(() => {
      Message.destroy({
        where: {},
        truncate: false
      }).then(() => console.log("All messages are removed"));
    });

  response.send(`All messages sent to all consumers`);
};

const sendToAllConsumers = (messages: any) => {
  for (let consumer of consumers) {
    request.post(
      `${consumer.url}/receive`,
      {
        json: {
          resultMessages: messages
        }
      },
      (error, response, body) => {
        if (error) {
          console.error(error);
          return;
        }
      }
    );
  }
};

const getAllMessages = (
  request: express.Request,
  response: express.Response
) => {
  Message.findAll().then((messages: any) => {
    messages = _.map(messages, m => m.dataValues.content);
    response.status(200).json(messages);
  });
};

const createMessage = (
  request: express.Request,
  response: express.Response
) => {
  const { content } = request.body;
  console.log(`Message: '${content}' added.`);

  Message.create({
    content: content
  }).then((message: any) => {
    response.status(200).send(`Message: '${message.content}' added.`);
  });
};

const consumeAllMessages = (
  request: express.Request,
  response: express.Response
) => {
  Message.findAll()
    .then((messages: any) => {
      messages = _.map(messages, m => m.dataValues.content);
      response.status(200).json(messages);
    })
    .then(() => {
      Message.destroy({
        where: {},
        truncate: false
      }).then(() => console.log("All messages are removed"));
    });
};

const indexPage = (request: express.Request, response: express.Response) => {
  checkDbConnection();
  response.json({
    info: "Message broker (Node.js, Express, and PostgreSQL.)"
  });
};

app.get("/", indexPage);
app.get("/messages", getAllMessages);
app.post("/messages", createMessage);
app.get("/messages/publish", publish);
app.get("/messages/consume", consumeAllMessages);
app.post("/messages/subscribe", subscribe);
app.post("/messages/unsubscribe", unsubscribe);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => printAppInfo("BROKER", port));
