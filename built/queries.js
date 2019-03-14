"use strict";
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
    //const id = parseInt(request.params.id);
    pool.query("SELECT * FROM messages ORDER BY id DESC limit 1", function (error, results) {
        if (error) {
            throw error;
        }
        var selectedRow = JSON.stringify(results.rows[0]);
        console.log("selected: " + selectedRow);
        response.status(200).json(results.rows[0]);
    });
    pool.query("DELETE FROM messages WHERE id=(SELECT MAX(id) FROM messages)", function (error, results) {
        if (error) {
            throw error;
        }
        //console.log(selectResults);
        response.status(200); //.json("deleted message");
    });
};
module.exports = {
    getMessages: getMessages,
    createMessage: createMessage,
    deleteMessage: deleteMessage,
    consumeMessage: consumeMessage
};
// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id)
//   pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }
// const updateUser = (request, response) => {
//   const id = parseInt(request.params.id)
//   const { name, email } = request.body
//   pool.query(
//     'UPDATE users SET name = $1, email = $2 WHERE id = $3',
//     [name, email, id],
//     (error, results) => {
//       if (error) {
//         throw error
//       }
//       response.status(200).send(`User modified with ID: ${id}`)
//     }
//   )
// }
