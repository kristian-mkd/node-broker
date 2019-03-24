import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { brokerUrl } from "./util/constants";
import { printAppInfo } from "./util/consoleUtil";

export const app = express();
let port = optimist.argv.port || 8001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sendMessage = (req: express.Request, response: express.Response) => {
  const { content } = req.body;
  const sender = `http://localhost:${port}`;
  let payload = {
    json: {
      content: content,
      sender: sender
    }
  };
  request.post(`${brokerUrl}/messages`, payload, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(`${body}`);
  });
  response.status(200).json(`Message sent with content=[${content}], from sender=[${sender}]`);
};

app.post("/send", sendMessage);
app.get("/", (request, response) => {
  response.json("Producer app");
});

app.listen(port, () => printAppInfo("PRODUCER", port));
