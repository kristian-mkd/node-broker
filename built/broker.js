"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var lodash_1 = __importDefault(require("lodash"));
var app = express_1.default();
var bodyParser = require("body-parser");
var consoleUtil = require("./consoleUtil");
var db = require("./queries");
var port = require("optimist").argv.port;
var publishers = [];
var consumers = [];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function (request, response) {
    response.json({
        info: "Message broker application written in Node.js, Express, and PostgreSQL."
    });
});
app.post("/messages/subscribe", function (request, response) {
    var consumer = request.body;
    consumers.push(consumer);
    console.log(consumers);
    response.json({
        info: "Consumer with url: " + consumer.url + " successfully subscribed."
    });
});
app.post("/messages/unsubscribe", function (request, response) {
    var consumerUrl = request.body.url;
    consumers = lodash_1.default.filter(consumers, function (consumer) { return consumer.url !== consumerUrl; });
    console.log(consumers);
    response.json({
        info: "Consumer with url: " + consumerUrl + " successfully unsubscribed."
    });
});
// app.get(
//   "/messages/consume",
//   (req: express.Request, resp: express.Response) => {
//     request.post(
//       `${consumers[0]}/subscribe`,
//       {
//         json: {
//           url: consumerUrl
//         }
//       },
//       (error, response, body) => {
//         if (error) {
//           console.error(error);
//           return;
//         }
//         console.log(body);
//       }
//     );
//   }
// );
app.get("/messages", db.getMessages);
app.post("/messages", db.createMessage);
app.delete("/messages/:id", db.deleteMessage);
//app.get("/messages/consume", db.consumeMessage);
app.listen(port, consoleUtil.printAppInfo("BROKER", port));
