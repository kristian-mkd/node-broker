import express from "express";
import request from "request";
import _ from "lodash";

const app = express();
const bodyParser = require("body-parser");
const consoleUtil = require("./util/consoleUtil");
const messageRepository = require("./data/messageRepository");
const port = require("optimist").argv.port;

var consumers: Array<Consumer> = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  messageRepository.Message.findAll()
    .then((messages: any) => {
      messages = _.map(messages, m => m.dataValues.content);
      sendToAllConsumers(messages);
    })
    .then(() => {
      messageRepository.Message.destroy({
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
  messageRepository.Message.findAll().then((messages: any) => {
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

  messageRepository.Message.create({
    content: content
  }).then((message: any) => {
    response.status(200).send(`Message: '${message.content}' added.`);
  });
};

const consumeAllMessages = (
  request: express.Request,
  response: express.Response
) => {
  messageRepository.Message.findAll()
    .then((messages: any) => {
      messages = _.map(messages, m => m.dataValues.content);
      response.status(200).json(messages);
    })
    .then(() => {
      messageRepository.Message.destroy({
        where: {},
        truncate: false
      }).then(() => console.log("All messages are removed"));
    });
};

app.get("/messages", getAllMessages);
app.post("/messages", createMessage);
app.get("/messages/publish", publish);
app.get("/messages/consume", consumeAllMessages);
app.post("/messages/subscribe", subscribe);
app.post("/messages/unsubscribe", unsubscribe);

app.get("/", (request: express.Request, response: express.Response) => {
  console.log(messageRepository.checkDbConnection());
  response.json({
    info: "Message broker (Node.js, Express, and PostgreSQL.)"
  });
});

app.listen(port, consoleUtil.printAppInfo("BROKER", port));
