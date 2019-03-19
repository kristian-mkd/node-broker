"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figlet = require("figlet");
exports.printAppInfo = function (appName, port) {
    figlet(appName, function (err, data) {
        if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
        }
        console.log(data);
        console.log("app running on port: " + port + ".");
    });
};
