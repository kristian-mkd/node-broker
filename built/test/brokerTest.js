"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var broker_1 = require("../broker");
var messageRepository_1 = require("../data/messageRepository");
var chai_1 = require("chai");
describe("hooks", function () {
    beforeEach(function (done) {
        messageRepository_1.deleteMessages();
        done();
    });
    describe("GET /", function () {
        it("should respond with info for broker app", function () {
            return supertest_1.default(broker_1.app)
                .get("/")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Message broker (Node.js, Express, and PostgreSQL.)");
            });
        });
    });
    describe("/GET messages", function () {
        it("should assert that there are no messages in the broker", function (done) {
            supertest_1.default(broker_1.app)
                .get("/messages")
                .end(function (error, response) {
                var body = response.body;
                chai_1.expect(body).to.be.an("array");
                chai_1.expect(body.length).to.be.eql(0);
                done();
            });
        });
    });
    describe("POST /messages", function () {
        it("should respond with info that a message has been created", function () {
            var content = "First test message.";
            var sender = "Broker";
            return supertest_1.default(broker_1.app)
                .post("/messages")
                .send({
                content: content,
                sender: sender,
                created_at: new Date()
            })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Message saved with Content=[" + content + "], FROM=[" + sender + "]");
            });
        });
    });
    describe("POST /subscribe", function () {
        it("should respond with info that a consumer has been subscribed successfully", function () {
            var consumer = "First consumer.";
            return supertest_1.default(broker_1.app)
                .post("/messages/subscribe")
                .send({
                consumer: consumer
            })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(201)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Consumer with url=[" + consumer + "] successfully subscribed.");
            });
        });
    });
    describe("POST /unsubscribe", function () {
        it("should respond with info that a consumer has been unsubscribed successfully", function () {
            var consumer = "First consumer.";
            return supertest_1.default(broker_1.app)
                .post("/messages/unsubscribe")
                .send({
                consumer: consumer
            })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(202)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Consumer with url=[" + consumer + "] successfully unsubscribed.");
            });
        });
    });
});
