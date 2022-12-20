"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
const ws_1 = require("ws");
const auctionsStore_1 = require("./auctions/auctionsStore");
const wsClients = new WeakMap;
var MessageType;
(function (MessageType) {
    MessageType["SubscribeAuction"] = "SubscribeAuction";
    MessageType["LeaveAuction"] = "LeaveAuction";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
function default_1(server) {
    const wss = new ws_1.WebSocket.Server({ noServer: true });
    wss.on('connection', function connection(ws) {
        /** Очистка от "мертвых" соединений (см ниже setInterval) */
        wsClients.set(ws, { isAlive: true });
        ws.on('pong', () => wsClients.set(ws, { isAlive: true }));
        /** Обработка входящих сообщений */
        ws.on('message', function message(data) {
            const wsd = ws;
            const { type, auctionId, userId } = JSON.parse(data);
            if (!type || !auctionId || !userId)
                return;
            switch (type) {
                case MessageType.SubscribeAuction:
                    auctionsStore_1.auctions.addParticipantToAuction(auctionId, { userId, ws: wsd });
                    break;
                case MessageType.LeaveAuction:
                    auctionsStore_1.auctions.removeParticipantFromAuction(auctionId, userId);
                    break;
            }
        });
    });
    setInterval(() => {
        wss.clients.forEach(ws => {
            const savedWs = wsClients.get(ws);
            if (!savedWs || savedWs.isAlive === false) {
                wsClients.delete(ws);
                ws.terminate();
                return;
            }
            wsClients.set(ws, { isAlive: false });
            ws.ping();
        });
    }, 10000);
    return wss;
}
exports.default = default_1;
