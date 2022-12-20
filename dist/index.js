"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const app_1 = __importDefault(require("./app"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const websocket_1 = __importDefault(require("./features/auction/websocket"));
const port = process.env.PORT;
const mode = process.env.MODE;
const httpServer = http_1.default.createServer(app_1.default)
    .listen(80, () => {
    console.log(`⚡️HTTP[server]: Server is running at https://localhost:80. Mode: ${mode}`);
});
const httpsServer = https_1.default.createServer({
    key: fs_1.default.readFileSync(path_1.default.resolve('./src/config/key.pem')),
    cert: fs_1.default.readFileSync(path_1.default.resolve('./src/config/cert.pem')),
    passphrase: 'helloworld'
}, app_1.default)
    .listen(443, () => {
    console.log(`⚡️HTTPS[server]: Server is running at https://localhost:443. Mode: ${mode}`);
});
exports.wss = (0, websocket_1.default)(httpsServer);
httpsServer.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = (0, url_1.parse)((request === null || request === void 0 ? void 0 : request.url) || '');
    if (pathname === '/auction') {
        exports.wss.handleUpgrade(request, socket, head, function done(ws) {
            exports.wss.emit('connection', ws, request);
        });
    }
    else {
        socket.destroy();
    }
});
