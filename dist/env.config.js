"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotenvConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
var Environment;
(function (Environment) {
    Environment["Production"] = "production";
    Environment["Development"] = "development";
    Environment["Test"] = "test";
})(Environment || (Environment = {}));
function dotenvConfig() {
    const environment = getEnvironment();
    if (environment === null)
        throw new Error(`Нет конфигурации`);
    // if (environment === Environment.Production) return
    dotenv_1.default.config({
        path: path_1.default.resolve(process.cwd(), `./src/config/.env.${environment}`),
    });
}
exports.dotenvConfig = dotenvConfig;
function getEnvironment() {
    const env = process.env['NODE_ENV'];
    if (env === undefined)
        return null;
    if (!Object.values(Environment).includes(env))
        return null;
    return env;
}
