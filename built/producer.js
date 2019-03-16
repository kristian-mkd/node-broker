"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var express_1 = __importDefault(require("express"));
var bodyParser = require("body-parser");
var app = express_1.default();
var port = require('optimist').argv.port;
//const producerUrl: string = `http://localhost:${port}/messages`;
var brokerUrl = "http://localhost:3000/messages";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var publishMessage = function (req, response) {
    var content = req.body.content;
    request_1.default.post(brokerUrl, {
        json: {
            content: content
        }
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log("statusCode: " + response.statusCode);
        console.log(body);
    });
    response.send("Published message with content: " + content);
};
app.post("/publish", publishMessage);
app.get("/", function (request, response) {
    response.json({ info: "Producer app" });
});
app.listen(port, function () {
    console.log("Producer app running on port " + port + ".");
});
