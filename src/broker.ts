import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { checkDbConnection, deleteMessages, Message } from "./data/messageRepository";
import { printAppInfo } from "./util/consoleUtil";

export const app = express();
const port = optimist.argv.port;
var consumers: Array<string> = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const createMessage = (request: express.Request, response: express.Response) => {
  const { content, sender } = request.body;
  const info = `Message saved with Content=[${content}], FROM=[${sender}]`;
  console.log(info);
  Message.create({
    content: content,
    sender: sender,
    created_at: new Date()
  }).then((message: Message) => {
    response.status(200).json(info);
  });
};

const getMessages = (request: express.Request, response: express.Response) => {
  Message.findAll().then((messageModels: Array<MessageModel>) => {
    response.status(200).json(convertToString(messageModels));
  });
};

const convertToString = (messageModels: Array<MessageModel>): string[] => {
  return _.map(messageModels, (model: MessageModel) => formatMessage(model.dataValues));
};

const formatMessage = (message: Message): string => {
  // TODO: fix the date time formating
  // Sun Mar 24 2019 09:57:05 GMT+0100 (Central European Standard Time)
  const createdAt = message.created_at.toString().substring(0, 24);
  return `Content=[${message.content}], From=[${message.sender}], CreatedAt=[${createdAt}]`;
};

const consumeMessages = (request: express.Request, response: express.Response) => {
  Message.findAll()
    .then((messageModels: Array<MessageModel>) => {
      response.status(200).json(convertToString(messageModels));
    })
    .then(deleteMessages);
};

const sendMessages = (request: express.Request, response: express.Response) => {
  if (_.size(consumers) === 0) {
    const info = "There are no subscribed consumers to receive the messages.";
    console.log(info);
    response.send(info);
    return;
  }
  Message.findAll()
    .then((messages: Array<MessageModel>) => {
      sendToConsumers(convertToString(messages));
    })
    .then(deleteMessages);
  response.send("All messages sent to all consumers.");
};

const sendToConsumers = (messages: Array<String>) => {
  for (let consumer of consumers) {
    let payload = {
      json: {
        messages: messages
      }
    };
    request.post(`${consumer}/receive`, payload, (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }
};

const subscribe = (request: express.Request, response: express.Response) => {
  const consumerToSubscribe = request.body.consumer;
  if (consumers.indexOf(consumerToSubscribe) === -1) {
    consumers.push(consumerToSubscribe);
  } else {
    return response.json(`Consumer with url=[${consumerToSubscribe}] already subscribed.`);
  }
  console.log(`Consumers: ${consumers}`);
  const info = `Consumer with url=[${consumerToSubscribe}] successfully subscribed.`;
  console.log(info);
  response.json(info);
};

const unsubscribe = (request: express.Request, response: express.Response) => {
  const consumerToUnsubscribe = request.body.consumer;
  consumers = _.filter(consumers, consumer => consumer !== consumerToUnsubscribe);
  console.log(`Consumers: ${consumers}`);
  const info = `Consumer with url=[${consumerToUnsubscribe}] successfully unsubscribed.`;
  console.log(info);
  response.json(info);
};

const index = (request: express.Request, response: express.Response) => {
  checkDbConnection();
  response.json("Message broker (Node.js, Express, and PostgreSQL.)");
};

export const baseUrl = "/messages";

app.get("/", index);
app.get(baseUrl, getMessages);
app.post(baseUrl, createMessage);
app.get(`${baseUrl}/send`, sendMessages);
app.get(`${baseUrl}/consume`, consumeMessages);
app.post(`${baseUrl}/subscribe`, subscribe);
app.post(`${baseUrl}/unsubscribe`, unsubscribe);

app.listen(port, () => printAppInfo("BROKER", port));
