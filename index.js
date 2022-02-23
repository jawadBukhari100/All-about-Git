"use strict";
exports.__esModule = true;
var express_1 = require("express");
var morgan_1 = require("morgan");
var swagger_ui_express_1 = require("swagger-ui-express");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var routes_1 = require("./src/routes");
var health = require('@cloudnative/health-connect');
var healthcheck = new health.HealthChecker();
var server = null;
var PORT = process.env.PORT || 5000;
function initApplication() {
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/FinalPRojectApi', { useNewUrlParser: true, useUnifiedTopology: true });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
    });
    var app = (0, express_1["default"])();
    app.use(express_1["default"].json());
    app.use((0, morgan_1["default"])("tiny"));
    app.use(express_1["default"].static("public"));
    app.use("/swagger", swagger_ui_express_1["default"].serve, swagger_ui_express_1["default"].setup(undefined, {
        swaggerOptions: {
            url: "/swagger.json"
        }
    }));
    app.use((0, cors_1["default"])());
    app.use(body_parser_1["default"].json());
    app.use(body_parser_1["default"].urlencoded({ extended: true }));
    app.use(routes_1.MainApi);
    app.use(function (err, req, res, next) {
        res.locals.message = err.message;
        var status = err.statusCode || 500;
        res.locals.status = status;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(status);
        return res.json({
            error: {
                message: err.message
            }
        });
    });
    app.use('/health', health.LivenessEndpoint(healthcheck));
    app.use('/ready', health.ReadinessEndpoint(healthcheck));
    return app;
}
function start() {
    var app = initApplication();
    server = app.listen(process.env.PORT || PORT, function () {
        console.log("Server started on PORT:" + PORT);
    });
}
// Start the application
start();