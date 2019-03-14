const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "brokerDb",
  password: "pg123",
  port: 5432
});

const getMessages = (request, response) => {
  pool.query("SELECT * FROM messages ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createMessage = (request, response) => {
  console.log("message added with post in broker");
  const { content } = request.body;

  pool.query(
    "INSERT INTO messages (content) VALUES ($1)",
    [content],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Message added.`);
    }
  );
};

const deleteMessage = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM messages WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Message deleted with ID: ${id}`);
  });
};

const consumeMessage = (request, response) => {
  //const id = parseInt(request.params.id);

  pool.query(
    "SELECT * FROM messages ORDER BY id DESC limit 1",
    (error, results) => {
      if (error) {
        throw error;
      }
      var selectedRow = JSON.stringify(results.rows[0]);
      console.log("selected: " + selectedRow);
      response.status(200).json(results.rows[0]);
    }
  );

  pool.query(
    "DELETE FROM messages WHERE id=(SELECT MAX(id) FROM messages)",
    (error, results) => {
      if (error) {
        throw error;
      }

      //console.log(selectResults);
      response.status(200); //.json("deleted message");
    }
  );
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  consumeMessage
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
