"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var express_1 = __importDefault(require("express"));
var bodyParser = require("body-parser");
var app = express_1.default();
var db = require("./queries");
var port = 3002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var consumeMessage = function (req, response) {
    //const { content } = req.body;
    request_1.default.get("http://localhost:3000/messages/consume", function (error, resp, body) {
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
app.get("/consume", consumeMessage);
app.get("/", function (request, response) {
    response.json({ info: "Consumer app" });
});
app.listen(port, function () {
    console.log("Consumer app running on port " + port + ".");
});
