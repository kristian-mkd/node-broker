"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_1 = __importDefault(require("express"));
var optimist_1 = __importDefault(require("optimist"));
var request_1 = __importDefault(require("request"));
var messageRepository_1 = require("./data/messageRepository");
var consoleUtil_1 = require("./util/consoleUtil");
exports.app = express_1.default();
var port = optimist_1.default.argv.port;
var consumers = [];
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
var getMessages = function (request, response) {
    messageRepository_1.Message.findAll().then(function (messageModels) {
        response.status(200).json(extractMessages(messageModels));
    });
};
var extractMessageContents = function (messageModels) {
    return lodash_1.default.map(messageModels, function (model) { return model.dataValues.content; });
};
var extractMessages = function (messageModels) {
    return lodash_1.default.map(messageModels, function (model) { return model.dataValues; });
};
var createMessage = function (request, response) {
    var content = request.body.content;
    console.log("Message: '" + content + "' added.");
    messageRepository_1.Message.create({
        content: content
    }).then(function (message) {
        response.status(200).send("Message: '" + message.content + "' added.");
    });
};
var consumeMessages = function (request, response) {
    messageRepository_1.Message.findAll()
        .then(function (messageModels) {
        response.status(200).json(extractMessageContents(messageModels));
    })
        .then(messageRepository_1.deleteMessages);
};
var sendMessages = function (request, response) {
    messageRepository_1.Message.findAll()
        .then(function (messages) {
        messages = lodash_1.default.map(messages, function (m) { return m.dataValues.content; });
        sendToConsumers(messages);
    })
        .then(messageRepository_1.deleteMessages);
    response.send("All messages sent to all consumers");
};
var sendToConsumers = function (messages) {
    for (var _i = 0, consumers_1 = consumers; _i < consumers_1.length; _i++) {
        var consumer = consumers_1[_i];
        var payload = {
            json: { resultMessages: messages }
        };
        request_1.default.post(consumer.url + "/receive", payload, function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            }
        });
    }
};
var subscribe = function (request, response) {
    var consumer = request.body;
    consumers.push(consumer);
    var message = "Consumer with url: " + consumer.url + " successfully subscribed.";
    console.log(message);
    response.json(message);
};
var unsubscribe = function (request, response) {
    var consumerUrl = request.body.url;
    consumers = lodash_1.default.filter(consumers, function (consumer) { return consumer.url !== consumerUrl; });
    console.log(consumers);
    response.json({
        info: "Consumer with url: " + consumerUrl + " successfully unsubscribed."
    });
};
var index = function (request, response) {
    messageRepository_1.checkDbConnection();
    response.json({
        info: "Message broker (Node.js, Express, and PostgreSQL.)"
    });
};
exports.baseUrl = "/messages";
exports.app.get("/", index);
exports.app.get(exports.baseUrl, getMessages);
exports.app.post(exports.baseUrl, createMessage);
exports.app.get(exports.baseUrl + "/send", sendMessages);
exports.app.get(exports.baseUrl + "/consume", consumeMessages);
exports.app.post(exports.baseUrl + "/subscribe", subscribe);
exports.app.post(exports.baseUrl + "/unsubscribe", unsubscribe);
exports.app.listen(port, function () { return consoleUtil_1.printAppInfo("BROKER", port); });
