"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var express_1 = __importDefault(require("express"));
var optimist_1 = __importDefault(require("optimist"));
var request_1 = __importDefault(require("request"));
var constants_1 = require("./util/constants");
var consoleUtil_1 = require("./util/consoleUtil");
exports.app = express_1.default();
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
var port = optimist_1.default.argv.port || 7001;
var consumerUrl = "http://localhost:" + port;
var consumeMessages = function (req, response) {
    request_1.default.get(constants_1.brokerUrl + "/messages/consume", function (error, resp, body) {
        if (error) {
            console.error(error);
            return;
        }
        var readMessages = JSON.parse(body);
        console.log("Consumed messages: \n" + readMessages.join("\n"));
        response.status(200).json({ consumedMessages: readMessages });
    });
};
var subscribe = function (req, response) {
    var payload = {
        json: {
            consumer: consumerUrl
        }
    };
    request_1.default.post(constants_1.brokerUrl + "/messages/subscribe", payload, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(body);
    });
    response.status(200).json("Consumer with url=[" + consumerUrl + "] is successfully subscribed.");
};
var unsubscribe = function (req, response) {
    var payload = {
        json: {
            consumer: consumerUrl
        }
    };
    request_1.default.post(constants_1.brokerUrl + "/messages/unsubscribe", payload, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(body);
    });
    response.status(202).json("Consumer with url=[" + consumerUrl + "] is successfully unsubscribed.");
};
var receiveMessages = function (request, response) {
    var messages = request.body.messages;
    console.log("Received messages: \n" + messages.join("\n"));
    response.json({ info: "Successfully received messages." });
};
var index = function (request, response) {
    response.json("Consumer app");
};
exports.app.get("/", index);
exports.app.get("/consume", consumeMessages);
exports.app.post("/receive", receiveMessages);
exports.app.get("/subscribe", subscribe);
exports.app.delete("/unsubscribe", unsubscribe);
exports.app.listen(port, function () { return consoleUtil_1.printAppInfo("CONSUMER", port); });
