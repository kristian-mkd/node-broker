import request from "request";
import express from "express";

const bodyParser = require("body-parser");
const db = require("./queries");
const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const consumeMessage = (req: express.Request, response: express.Response) => {
  //const { content } = req.body;

  request.get("http://localhost:3000/messages/consume", (error, resp, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(`statusCode: ${resp.statusCode}`);
    console.log(body);
    response.status(200).json(body);
  });
  //return response.send("Consumed message:" + response.json);//('Consumed message ' + response.body);
};

app.get("/consume", consumeMessage);
app.get("/", (request, response) => {
  response.json({ info: "Consumer app" });
});

app.listen(port, () => {
  console.log(`Consumer app running on port ${port}.`);
});
