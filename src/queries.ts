import express from "express";
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "brokerDb",
  password: "pg123",
  port: 5432
});

const getMessages = (request: express.Request, response: express.Response) => {
  pool.query(
    "SELECT * FROM messages ORDER BY id ASC",
    (error: Object, results: any) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createMessage = (
  request: express.Request,
  response: express.Response
) => {
  console.log("message added with post in broker");
  const { content } = request.body;

  pool.query(
    "INSERT INTO messages (content) VALUES ($1)",
    [content],
    (error: Object, results: any) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Message added.`);
    }
  );
};

const deleteMessage = (
  request: express.Request,
  response: express.Response
) => {
  const id = parseInt(request.params.id);

  pool.query(
    "DELETE FROM messages WHERE id = $1",
    [id],
    (error: Object, results: any) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Message deleted with ID: ${id}`);
    }
  );
};

const consumeMessage = (
  request: express.Request,
  response: express.Response
) => {
  pool.query(
    "SELECT * FROM messages ORDER BY id DESC",
    (error: Object, results: any) => {
      if (error) {
        throw error;
      }
      var messages = { messages: results.rows };
      console.log(messages);
      response.status(200).json(messages);
    }
  );

  pool.query(
    "DELETE FROM messages", //WHERE id=(SELECT MAX(id) FROM messages)
    (error: Object, results: Object) => {
      if (error) {
        throw error;
      }
      //response.status(200); //.json("deleted message");
    }
  );
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  consumeMessage
};
