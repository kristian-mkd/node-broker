"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var broker_1 = require("../broker");
var producer_1 = require("../producer");
var chai_1 = require("chai");
describe("hooks", function () {
    before(function (done) {
        // wake broker app
        it("should start broker app", function () {
            return supertest_1.default(broker_1.app).get("/");
        });
        done();
    });
    describe("GET /", function () {
        it("should respond with info for producer app", function () {
            return supertest_1.default(producer_1.app)
                .get("/")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Producer app");
            });
        });
    });
    describe("POST /send", function () {
        it("should respond with info that a message has been sent", function () {
            var content = "First test message.";
            var sender = "http://localhost:8001";
            return supertest_1.default(producer_1.app)
                .post("/send")
                .send({
                content: content,
                sender: sender,
                created_at: new Date()
            })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(function (response) {
                chai_1.expect(response.body).to.eql("Message sent with content=[" + content + "], from sender=[" + sender + "]");
            });
        });
    });
});
