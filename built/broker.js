"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var request_1 = __importDefault(require("request"));
var lodash_1 = __importDefault(require("lodash"));
var app = express_1.default();
var bodyParser = require("body-parser");
var consoleUtil = require("./util/consoleUtil");
var messageRepository = require("./data/messageRepository");
var port = require("optimist").argv.port;
var consumers = [];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var subscribe = function (request, response) {
    var consumer = request.body;
    consumers.push(consumer);
    response.json({
        info: "Consumer with url: " + consumer.url + " successfully subscribed."
    });
};
var unsubscribe = function (request, response) {
    var consumerUrl = request.body.url;
    consumers = lodash_1.default.filter(consumers, function (consumer) { return consumer.url !== consumerUrl; });
    console.log(consumers);
    response.json({
        info: "Consumer with url: " + consumerUrl + " successfully unsubscribed."
    });
};
var publish = function (request, response) {
    messageRepository.Message.findAll()
        .then(function (messages) {
        messages = lodash_1.default.map(messages, function (m) { return m.dataValues.content; });
        sendToAllConsumers(messages);
    })
        .then(function () {
        messageRepository.Message.destroy({
            where: {},
            truncate: false
        }).then(function () { return console.log("All messages are removed"); });
    });
    response.send("All messages sent to all consumers");
};
var sendToAllConsumers = function (messages) {
    for (var _i = 0, consumers_1 = consumers; _i < consumers_1.length; _i++) {
        var consumer = consumers_1[_i];
        request_1.default.post(consumer.url + "/receive", {
            json: {
                resultMessages: messages
            }
        }, function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            }
        });
    }
};
var getAllMessages = function (request, response) {
    messageRepository.Message.findAll().then(function (messages) {
        messages = lodash_1.default.map(messages, function (m) { return m.dataValues.content; });
        response.status(200).json(messages);
    });
};
var createMessage = function (request, response) {
    var content = request.body.content;
    console.log("Message: '" + content + "' added.");
    messageRepository.Message.create({
        content: content
    }).then(function (message) {
        response.status(200).send("Message: '" + message.content + "' added.");
    });
};
var consumeAllMessages = function (request, response) {
    messageRepository.Message.findAll()
        .then(function (messages) {
        messages = lodash_1.default.map(messages, function (m) { return m.dataValues.content; });
        response.status(200).json(messages);
    })
        .then(function () {
        messageRepository.Message.destroy({
            where: {},
            truncate: false
        }).then(function () { return console.log("All messages are removed"); });
    });
};
app.get("/messages", getAllMessages);
app.post("/messages", createMessage);
app.get("/messages/publish", publish);
app.get("/messages/consume", consumeAllMessages);
app.post("/messages/subscribe", subscribe);
app.post("/messages/unsubscribe", unsubscribe);
app.get("/", function (request, response) {
    console.log(messageRepository.checkDbConnection());
    response.json({
        info: "Message broker (Node.js, Express, and PostgreSQL.)"
    });
});
app.listen(port, consoleUtil.printAppInfo("BROKER", port));
