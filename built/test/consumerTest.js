"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var consumer_1 = require("../consumer");
var broker_1 = require("../broker");
var messageRepository_1 = require("../data/messageRepository");
var chai_1 = require("chai");
describe("hooks", function () {
    before(function (done) {
        // wake broker app
        it("should start broker app", function () {
            return supertest_1.default(broker_1.app)
                .get("/");
        });
        messageRepository_1.deleteMessages();
        done();
    });
    describe("GET /", function () {
        it("should respond with info for consumer app", function () {
            return supertest_1.default(consumer_1.app)
                .get("/")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Consumer app");
            });
        });
    });
    describe("/GET subscribe", function () {
        it("should assert that subscription to broker is successful", function () {
            var consumerUrl = "http://localhost:7001";
            return supertest_1.default(consumer_1.app)
                .get("/subscribe")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(function (response) {
                var body = response.body;
                chai_1.expect(body).to.eql("Consumer with url=[" + consumerUrl + "] is successfully subscribed.");
            });
        });
    });
    describe("/DELETE unsubscribe", function () {
        it("should assert that consumer is successfully unsubscribed from broker", function () {
            var consumerUrl = "http://localhost:7001";
            return supertest_1.default(consumer_1.app)
                .delete("/unsubscribe")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(202)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Consumer with url=[" + consumerUrl + "] is successfully unsubscribed.");
            });
        });
    });
    describe("/GET messages", function () {
        it("should test the message consumption from the consumer", function (done) {
            supertest_1.default(consumer_1.app)
                .get("/consume")
                .end(function (error, response) {
                var consumedMessages = response.body.consumedMessages;
                chai_1.expect(consumedMessages).to.be.an("array");
                chai_1.expect(consumedMessages.length).to.be.eql(0);
                done();
            });
        });
    });
});
