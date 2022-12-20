"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualWebsockets = exports.removeParticipant = exports.addParticipant = exports.getNewAuction = void 0;
const auctionTimer_1 = require("../timer/auctionTimer");
function getNewAuction(auctionId) {
    return {
        id: auctionId,
        timer: (0, auctionTimer_1.getTimer)(auctionId),
        participants: new Map(),
        activeWebSockets: []
    };
}
exports.getNewAuction = getNewAuction;
function addParticipant(auction, participant) {
    const newParticipants = auction.participants.set(participant.userId, participant);
    return Object.assign(Object.assign({}, auction), { participants: newParticipants, activeWebSockets: getActualWebsockets(newParticipants) });
}
exports.addParticipant = addParticipant;
function removeParticipant(auction, userId) {
    const { participants } = auction;
    participants.delete(userId);
    return Object.assign(Object.assign({}, auction), { participants, activeWebSockets: getActualWebsockets(participants) });
}
exports.removeParticipant = removeParticipant;
/** Обновляет список актуальных сокетов. Прямое добавление / удаление сокета
 * из массива было бы быстрее. Но операция не должна быть частой
 */
function getActualWebsockets(participants) {
    return Array
        .from(participants.values())
        .map(p => p.ws)
        .filter(Boolean);
}
exports.getActualWebsockets = getActualWebsockets;
