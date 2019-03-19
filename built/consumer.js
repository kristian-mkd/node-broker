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
var consoleUtil_1 = require("./util/consoleUtil");
var app = express_1.default();
var port = optimist_1.default.argv.port;
var brokerUrl = "http://localhost:3000";
var consumerUrl = "http://localhost:" + port;
var consumeMessages = function (req, response) {
    request_1.default.get(brokerUrl + "/messages/consume", function (error, resp, body) {
        if (error) {
            console.error(error);
            return;
        }
        var readMessages = JSON.parse(body);
        console.log(readMessages);
        readMessages.messages = lodash_1.default.map(readMessages.messages, function (message) { return message.content; });
        response.status(200).json(readMessages);
    });
};
var subscribe = function (req, response) {
    request_1.default.post(brokerUrl + "/messages/subscribe", {
        json: {
            url: consumerUrl
        }
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(body);
    });
    response.send("Consumer with url: " + consumerUrl + " is successfully subscribed");
};
var unsubscribe = function (req, response) {
    request_1.default.post(brokerUrl + "/messages/unsubscribe", {
        json: {
            url: consumerUrl
        }
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log(body);
    });
    response.send("Consumer with url: " + consumerUrl + " is successfully unsubscribed");
};
var receiveMessages = function (request, response) {
    var receivedMessages = JSON.stringify(request.body);
    console.log("Received messages: " + receivedMessages);
    response.json({ info: "Successfully received messages" });
};
app.get("/subscribe", subscribe);
app.delete("/unsubscribe", unsubscribe);
app.get("/consume", consumeMessages);
app.post("/receive", receiveMessages);
app.get("/", function (request, response) {
    response.json({ info: "Consumer app" });
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.listen(port, function () { return consoleUtil_1.printAppInfo("CONSUMER", port); });
