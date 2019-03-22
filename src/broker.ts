import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { checkDbConnection, deleteMessages, Message } from "./data/messageRepository";
import { printAppInfo } from "./util/consoleUtil";

export const app = express();
const port = optimist.argv.port;
var consumers: Array<Consumer> = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const getMessages = (request: express.Request, response: express.Response) => {
  Message.findAll().then((messageModels: Array<MessageModel>) => {
    response.status(200).json(extractMessages(messageModels));
  });
};

const extractMessageContents = (messageModels: Array<MessageModel>): string[] => {
  return _.map(messageModels, (model: MessageModel) => model.dataValues.content);
};

const extractMessages = (messageModels: Array<MessageModel>): Message[] => {
  return _.map(messageModels, (model: MessageModel) => model.dataValues);
};

const createMessage = (request: express.Request, response: express.Response) => {
  const { content } = request.body;
  console.log(`Message: '${content}' added.`);
  Message.create({
    content: content
  }).then((message: Message) => {
    response.status(200).send(`Message: '${message.content}' added.`);
  });
};

const consumeMessages = (request: express.Request, response: express.Response) => {
  Message.findAll()
    .then((messageModels: Array<MessageModel>) => {
      response.status(200).json(extractMessageContents(messageModels));
    })
    .then(deleteMessages);
};

const sendMessages = (request: express.Request, response: express.Response) => {
  Message.findAll()
    .then((messages: any) => {
      messages = _.map(messages, m => m.dataValues.content);
      sendToConsumers(messages);
    })
    .then(deleteMessages);
  response.send(`All messages sent to all consumers`);
};

const sendToConsumers = (messages: any) => {
  for (let consumer of consumers) {
    let payload = {
      json: { resultMessages: messages }
    };
    request.post(`${consumer.url}/receive`, payload, (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }
};

const subscribe = (request: express.Request, response: express.Response) => {
  const consumer = request.body;
  consumers.push(consumer);
  const message = `Consumer with url: ${consumer.url} successfully subscribed.`;
  console.log(message);
  response.json(message);
};

const unsubscribe = (request: express.Request, response: express.Response) => {
  const consumerUrl = request.body.url;
  consumers = _.filter(consumers, consumer => consumer.url !== consumerUrl);
  console.log(consumers);
  response.json({
    info: `Consumer with url: ${consumerUrl} successfully unsubscribed.`
  });
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
