"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool = require("pg").Pool;
var pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "brokerDb",
    password: "pg123",
    port: 5432
});
var getMessages = function (request, response) {
    pool.query("SELECT * FROM messages ORDER BY id ASC", function (error, results) {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};
var createMessage = function (request, response) {
    console.log("message added with post in broker");
    var content = request.body.content;
    pool.query("INSERT INTO messages (content) VALUES ($1)", [content], function (error, results) {
        if (error) {
            throw error;
        }
        response.status(201).send("Message added.");
    });
};
var deleteMessage = function (request, response) {
    var id = parseInt(request.params.id);
    pool.query("DELETE FROM messages WHERE id = $1", [id], function (error, results) {
        if (error) {
            throw error;
        }
        response.status(200).send("Message deleted with ID: " + id);
    });
};
var consumeMessage = function (request, response) {
    pool.query("SELECT * FROM messages ORDER BY id DESC", function (error, results) {
        if (error) {
            throw error;
        }
        var messages = { messages: results.rows };
        console.log(messages);
        response.status(200).json(messages);
    });
    pool.query("DELETE FROM messages", //WHERE id=(SELECT MAX(id) FROM messages)
    function (error, results) {
        if (error) {
            throw error;
        }
        //response.status(200); //.json("deleted message");
    });
};
module.exports = {
    getMessages: getMessages,
    createMessage: createMessage,
    deleteMessage: deleteMessage,
    consumeMessage: consumeMessage
};
