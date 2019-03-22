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
  const { content } = request.body;
  const info = `Message: '${content}' added.`;
  console.log(info);
  Message.create({
    content: content
  }).then((message: Message) => {
    response.status(200).send(info);
  });
};

const getMessages = (request: express.Request, response: express.Response) => {
  Message.findAll().then((messageModels: Array<MessageModel>) => {
    response.status(200).json(extractMessageContents(messageModels));
  });
};

const extractMessageContents = (messageModels: Array<MessageModel>): string[] => {
  return _.map(messageModels, (model: MessageModel) => model.dataValues.content);
};

const consumeMessages = (request: express.Request, response: express.Response) => {
  Message.findAll()
    .then((messageModels: Array<MessageModel>) => {
      response.status(200).json(extractMessageContents(messageModels));
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
      const messageContents = _.map(messages, m => m.dataValues.content);
      sendToConsumers(messageContents);
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
    return response.json(`Consumer with url: ${consumerToSubscribe} already subscribed.`);
  }
  console.log(`Consumers: ${consumers}`);
  const info = `Consumer with url: ${consumerToSubscribe} successfully subscribed.`;
  console.log(info);
  response.json(info);
};

const unsubscribe = (request: express.Request, response: express.Response) => {
  const consumerToUnsubscribe = request.body.consumer;
  consumers = _.filter(consumers, consumer => consumer !== consumerToUnsubscribe);
  console.log(`Consumers: ${consumers}`);
  const info = `Consumer with url: ${consumerToUnsubscribe} successfully unsubscribed.`;
  console.log(info);
  response.json(info);
};

const index = (request: express.Request, response: express.Response) => {
  checkDbConnection();
  response.json({
    info: "Message broker (Node.js, Express, and PostgreSQL.)"
  });
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
