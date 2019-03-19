"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var express_1 = __importDefault(require("express"));
var request_1 = __importDefault(require("request"));
var consoleUtil_1 = require("./util/consoleUtil");
var optimist_1 = __importDefault(require("optimist"));
var app = express_1.default();
var port = optimist_1.default.argv.port;
var brokerUrl = "http://localhost:3000/messages";
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
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.listen(port, function () { return consoleUtil_1.printAppInfo("PRODUCER", port); });
