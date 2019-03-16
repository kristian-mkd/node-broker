import request from "request";
import express from "express";

const bodyParser = require("body-parser");
const app = express();
const port = require('optimist').argv.port;
//const producerUrl: string = `http://localhost:${port}/messages`;
const brokerUrl: string = "http://localhost:3000/messages";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const publishMessage = (req: express.Request, response: express.Response) => {
  const { content } = req.body;

  request.post(
    brokerUrl,
    {
      json: {
        content: content
      }
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${response.statusCode}`);
      console.log(body);
    }
  );
  response.send(`Published message with content: ${content}`);
};

app.post("/publish", publishMessage);
app.get("/", (request, response) => {
  response.json({ info: "Producer app" });
});

app.listen(port, () => {
  console.log(`Producer app running on port ${port}.`);
});
