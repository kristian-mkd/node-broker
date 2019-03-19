import bodyParser from "body-parser";
import express from "express";
import request from "request";
import { printAppInfo } from "./util/consoleUtil";
import optimist from "optimist";

const app = express();
const port = optimist.argv.port;
const brokerUrl: string = "http://localhost:3000/messages";

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => printAppInfo("PRODUCER", port));
