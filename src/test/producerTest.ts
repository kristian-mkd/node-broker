import request from "supertest";
import { app as brokerApp } from "../broker";
import { app as producerApp } from "../producer";
import { expect } from "chai";

describe("hooks", () => {
  before(done => {
    // wake broker app
    it("should start broker app", () => {
      return request(brokerApp).get("/");
    });
    done();
  });

  describe("GET /", () => {
    it("should respond with info for producer app", () => {
      return request(producerApp)
        .get("/")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((response: any) => {
          expect(response.body).to.eql("Producer app");
        });
    });
  });

  describe("POST /send", () => {
    it("should respond with info that a message has been sent", () => {
      const content = "First test message.";
      const sender = "http://localhost:8001";
      return request(producerApp)
        .post("/send")
        .send({
          content: content,
          sender: sender,
          created_at: new Date()
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((response: any) => {
          expect(response.body).to.eql(
            `Message sent with content=[${content}], from sender=[${sender}]`
          );
        });
    });
  });
});
