"use strict";
var request = require("request");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//const db = require("./queries");
var port = 3001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var publishMessage = function (req, response) {
    var content = req.body.content;
    request.post("http://localhost:3000/messages", {
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
    response.send("Published message " + content);
};
app.post("/publish", publishMessage);
app.get("/", function (request, response) {
    response.json({ info: "Publisher app" });
});
app.listen(port, function () {
    console.log("Publisher app running on port " + port + ".");
});
