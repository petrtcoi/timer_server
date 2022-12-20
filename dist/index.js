"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const app_1 = __importDefault(require("./app"));
const url_1 = require("url");
const websocket_1 = __importDefault(require("./features/auction/websocket"));
const port = process.env.PORT;
const mode = process.env.MODE;
const server = app_1.default.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}. Mode: ${mode}`);
});
exports.wss = (0, websocket_1.default)(server);
server.on('upgrade', function upgrade(request, socket, head) {
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
