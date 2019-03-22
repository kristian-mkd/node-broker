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
var app = express_1.default();
var port = optimist_1.default.argv.port;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
var sendMessage = function (req, response) {
    var content = req.body.content;
    var payload = { json: { content: content } };
    request_1.default.post(constants_1.brokerUrl + "/messages", payload, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        console.log("Response statusCode: " + response.statusCode);
        console.log("Response body: " + body);
    });
    response.send("Message was sent with content: \"" + content + "\"");
};
app.post("/send", sendMessage);
app.get("/", function (request, response) {
    response.json({ info: "Producer app" });
});
app.listen(port, function () { return consoleUtil_1.printAppInfo("PRODUCER", port); });
