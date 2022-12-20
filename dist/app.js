"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_config_1 = require("./env.config");
const router_1 = __importDefault(require("./features/auction/router"));
(0, env_config_1.dotenvConfig)();
Object.freeze(Object.prototype);
const app = (0, express_1.default)();
// MIDDLEWARE
app.use((0, cors_1.default)());
// ROUTERS
app.use('/auction', router_1.default);
app.get('/', (_, res) => {
    res.status(200).send('Im alive');
});
exports.default = app;
