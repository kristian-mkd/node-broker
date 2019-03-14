"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var lodash_1 = __importDefault(require("lodash"));
var bodyParser = require("body-parser");
var db = require("./queries");
var app = express_1.default();
var port = 3000;
var publishers = [];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get("/", function (request, response) {
    response.json({ info: "Node.js, Express, and Postgres API" });
});
app.get("/messages/subscribe", function (request, response) {
    publishers.push({
        publisher: "first publisher"
    });
    console.log(publishers);
    response.json({ info: "Publisher added." });
});
app.delete("/messages/subscribe", function (request, response) {
    publishers = lodash_1.default.dropRight(publishers);
    console.log(publishers);
    response.json({ info: "Publisher removed." });
});
app.get("/messages", db.getMessages);
app.post("/messages", db.createMessage);
app.delete("/messages/:id", db.deleteMessage);
app.get("/messages/consume", db.consumeMessage);
app.listen(port, function () {
    console.log("Broker app running on port " + port + ".");
});
