"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var express_1 = __importDefault(require("express"));
var app = express_1.default();
var bodyParser = require("body-parser");
var consoleUtil = require("./consoleUtil");
var port = require("optimist").argv.port;
var brokerUrl = "http://localhost:3000/messages";
var consumerUrl = "http://localhost:" + port + "/messages";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var consumeMessage = function (req, response) {
    //const { content } = req.body;
    request_1.default.get(brokerUrl + "/consume", function (error, resp, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log("statusCode: " + resp.statusCode);
        console.log(body);
        response.status(200).json(body);
    });
    //return response.send("Consumed message:" + response.json);//('Consumed message ' + response.body);
};
var subscribe = function (req, response) {
    request_1.default.post(brokerUrl + "/subscribe", {
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
    request_1.default.post(brokerUrl + "/unsubscribe", {
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
app.get("/subscribe", subscribe);
app.delete("/unsubscribe", unsubscribe);
app.get("/consume", consumeMessage);
app.get("/", function (request, response) {
    response.json({ info: "Consumer app" });
});
app.listen(port, consoleUtil.printAppInfo("CONSUMER", port));
