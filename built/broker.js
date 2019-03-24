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
var createMessage = function (request, response) {
    var _a = request.body, content = _a.content, sender = _a.sender;
    var info = "Message saved with Content=[" + content + "], FROM=[" + sender + "]";
    console.log(info);
    messageRepository_1.Message.create({
        content: content,
        sender: sender,
        created_at: new Date()
    }).then(function (message) {
        response.status(200).json(info);
    });
};
var getMessages = function (request, response) {
    messageRepository_1.Message.findAll().then(function (messageModels) {
        response.status(200).json(convertToString(messageModels));
    });
};
var convertToString = function (messageModels) {
    return lodash_1.default.map(messageModels, function (model) { return formatMessage(model.dataValues); });
};
var formatMessage = function (message) {
    // TODO: fix the date time formating
    // Sun Mar 24 2019 09:57:05 GMT+0100 (Central European Standard Time)
    var createdAt = message.created_at.toString().substring(0, 24);
    return "Content=[" + message.content + "], From=[" + message.sender + "], CreatedAt=[" + createdAt + "]";
};
var consumeMessages = function (request, response) {
    messageRepository_1.Message.findAll()
        .then(function (messageModels) {
        response.status(200).json(convertToString(messageModels));
    })
        .then(messageRepository_1.deleteMessages);
};
var sendMessages = function (request, response) {
    if (lodash_1.default.size(consumers) === 0) {
        var info = "There are no subscribed consumers to receive the messages.";
        console.log(info);
        response.send(info);
        return;
    }
    messageRepository_1.Message.findAll()
        .then(function (messages) {
        sendToConsumers(convertToString(messages));
    })
        .then(messageRepository_1.deleteMessages);
    response.send("All messages sent to all consumers.");
};
var sendToConsumers = function (messages) {
    for (var _i = 0, consumers_1 = consumers; _i < consumers_1.length; _i++) {
        var consumer = consumers_1[_i];
        var payload = {
            json: {
                messages: messages
            }
        };
        request_1.default.post(consumer + "/receive", payload, function (error, response, body) {
            if (error) {
                console.error(error);
                return;
            }
        });
    }
};
var subscribe = function (request, response) {
    var consumerToSubscribe = request.body.consumer;
    if (consumers.indexOf(consumerToSubscribe) === -1) {
        consumers.push(consumerToSubscribe);
    }
    else {
        return response.json("Consumer with url=[" + consumerToSubscribe + "] already subscribed.");
    }
    console.log("Consumers: " + consumers);
    var info = "Consumer with url=[" + consumerToSubscribe + "] successfully subscribed.";
    console.log(info);
    response.json(info);
};
var unsubscribe = function (request, response) {
    var consumerToUnsubscribe = request.body.consumer;
    consumers = lodash_1.default.filter(consumers, function (consumer) { return consumer !== consumerToUnsubscribe; });
    console.log("Consumers: " + consumers);
    var info = "Consumer with url=[" + consumerToUnsubscribe + "] successfully unsubscribed.";
    console.log(info);
    response.json(info);
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
