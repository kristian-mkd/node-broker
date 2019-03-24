import request from 'supertest';
import { app } from '../broker';
import { deleteMessages } from '../data/messageRepository';
import { expect } from 'chai';

describe("hooks", () => {
  beforeEach(done => {
    deleteMessages();
    done();
  });

  describe("GET /", () => {
    it("should respond with info for broker app", () => {
      return request(app)
        .get("/")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((response: any) => {
          expect(response.body).to.eql("Message broker (Node.js, Express, and PostgreSQL.)");
        });
    });
  });

  describe("/GET messages", () => {
    it("should assert that there are no messages in the broker", done => {
      request(app)
        .get("/messages")
        .end((error: any, response: any) => {
          const body = response.body;
          expect(body).to.be.an("array");
          expect(body.length).to.be.eql(0);
          done();
        });
    });
  });

  describe("POST /messages", () => {
    it("should respond with info that a message has been created", () => {
      const content = "First test message.";
      const sender = "Broker";
      return request(app)
        .post("/messages")
        .send({
          content: content,
          sender: sender,
          created_at: new Date()
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(201)
        .then((response: any) => {
          expect(response.body).to.eql(`Message saved with Content=[${content}], FROM=[${sender}]`);
        });
    });
  });

  describe("POST /subscribe", () => {
    it("should respond with info that a consumer has been subscribed successfully", () => {
      const consumer = "First consumer.";
      return request(app)
        .post("/messages/subscribe")
        .send({
          consumer: consumer
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(201)
        .then((response: any) => {
          expect(response.body).to.eql(`Consumer with url=[${consumer}] successfully subscribed.`);
        });
    });
  });

  describe("POST /unsubscribe", () => {
    it("should respond with info that a consumer has been unsubscribed successfully", () => {
      const consumer = "First consumer.";
      return request(app)
        .post("/messages/unsubscribe")
        .send({
          consumer: consumer
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(202)
        .then((response: any) => {
          expect(response.body).to.eql(`Consumer with url=[${consumer}] successfully unsubscribed.`);
        });
    });
  });
});
