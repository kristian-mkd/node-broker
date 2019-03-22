import bodyParser from "body-parser";
import express from "express";
import optimist from "optimist";
import request from "request";
import { brokerUrl } from "./util/constants";
import { printAppInfo } from "./util/consoleUtil";

const app = express();
const port = optimist.argv.port;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sendMessage = (req: express.Request, response: express.Response) => {
  const { content } = req.body;
  let payload = { json: { content: content } };
  request.post(`${brokerUrl}/messages`, payload, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(`Response statusCode: ${response.statusCode}`);
    console.log(`Response body: ${body}`);
  });
  response.send(`Message was sent with content: "${content}"`);
};

app.post("/send", sendMessage);
app.get("/", (request, response) => {
  response.json({ info: "Producer app" });
});

app.listen(port, () => printAppInfo("PRODUCER", port));
