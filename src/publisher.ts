import request from "request";
import express from "express";

const bodyParser = require("body-parser");
const app = express();
const port = 3001;
const publisherUrl: string = `http://localhost:${port}/messages`;
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
  response.send("Published message " + content);
};

app.post("/publish", publishMessage);
app.get("/", (request, response) => {
  response.json({ info: "Publisher app" });
});

app.listen(port, () => {
  console.log(`Publisher app running on port ${port}.`);
});
