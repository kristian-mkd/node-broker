import request from "supertest";
import { app as consumerApp } from "../consumer";
import { app as brokerApp } from "../broker";
import { deleteMessages } from "../data/messageRepository";
import { expect } from "chai";

describe("hooks", () => {
  before(done => {
    // wake broker app
    it("should start broker app", () => {
      return request(brokerApp)
        .get("/")
    });
    deleteMessages();
    done();
  });

  describe("GET /", () => {
    it("should respond with info for consumer app", () => {
      return request(consumerApp)
        .get("/")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((response: any) => {
          expect(response.body).to.eql("Consumer app");
        });
    });
  });

  describe("/GET subscribe", () => {
    it("should assert that subscription to broker is successful", () => {
      const consumerUrl = "http://localhost:7001";
      return request(consumerApp)
        .get("/subscribe")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((response: any) => {
          const body = response.body;
          expect(body).to.eql(`Consumer with url=[${consumerUrl}] is successfully subscribed.`);
        });
    });
  });

  describe("/DELETE unsubscribe", () => {
    it("should assert that consumer is successfully unsubscribed from broker", () => {
      const consumerUrl = "http://localhost:7001";
      return request(consumerApp)
        .delete("/unsubscribe")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(202)
        .then((response: any) => {
          expect(response.body).to.eql(
            `Consumer with url=[${consumerUrl}] is successfully unsubscribed.`
          );
        });
    });
  });

  describe("/GET messages", () => {
    it("should test the message consumption from the consumer", done => {
      request(consumerApp)
        .get("/consume")
        .end((error: any, response: any) => {
          const consumedMessages = response.body.consumedMessages;
          expect(consumedMessages).to.be.an("array");
          expect(consumedMessages.length).to.be.eql(0);
          done();
        });
    });
  });
});
