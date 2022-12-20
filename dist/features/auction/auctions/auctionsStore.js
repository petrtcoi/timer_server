"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctions = void 0;
const auction_1 = require("./auction");
const result_1 = require("../../../types/result");
exports.auctions = auctionsStoreFactory().init();
function auctionsStoreFactory() {
    let instance;
    return {
        init: () => {
            if (!instance)
                instance = _auctionsStore();
            return instance;
        }
    };
}
function _auctionsStore() {
    let auctionsList = new Map();
    /**
     *  Проверяет, создан ли уже такой аукцион. Возвращает его.
     *  Логика, что делать, если таймера / аукциона не существует, здесь опущена. Просто создаем новый аукцион
     */
    function getAuction(auctionId) {
        const oldAuction = auctionsList.get(auctionId);
        if (oldAuction !== undefined) {
            return oldAuction;
        }
        const newAuction = (0, auction_1.getNewAuction)(auctionId);
        newAuction.timer.start();
        auctionsList.set(auctionId, newAuction);
        return newAuction;
    }
    /**
    *  Просто сбрасываем таймеры и удаляем аукцион из хранилища
    */
    function removeAuction(auctionId) {
        const oldAuction = auctionsList.get(auctionId);
        if (oldAuction !== undefined)
            oldAuction.timer.drop();
        auctionsList.delete(auctionId);
        return result_1.ResultType.Ok;
    }
    /** Добавляем участника в аукцион */
    function addParticipantToAuction(auctionId, participant) {
        const auction = auctionsList.get(auctionId);
        if (!auction)
            return result_1.ResultType.Error;
        auctionsList.set(auctionId, (0, auction_1.addParticipant)(auction, participant));
        return result_1.ResultType.Ok;
    }
    /** Удаляем участника из аукциона */
    function removeParticipantFromAuction(auctionId, userId) {
        var _a;
        const auction = auctionsList.get(auctionId);
        if (!auction)
            return result_1.ResultType.Error;
        const ws = (_a = auction.participants.get(userId)) === null || _a === void 0 ? void 0 : _a.ws;
        if (ws)
            ws.close();
        auctionsList.set(auctionId, (0, auction_1.removeParticipant)(auction, userId));
        return result_1.ResultType.Ok;
    }
    /** Получаем список websocket для уведомлений */
    function getAuctionWebsockets(auctionId) {
        const auction = auctionsList.get(auctionId);
        if (!auction)
            return [];
        return auction.activeWebSockets;
    }
    /** Получаем список пользователей */
    function getAuctionParticipants(auctionId) {
        const auction = auctionsList.get(auctionId);
        if (!auction)
            return [];
        return Array.from(auction.participants.values()).map(x => x.userId);
    }
    /** Список всех аукционов */
    function listOfAuctions() {
        return Array.from(auctionsList.values());
    }
    return {
        getAuction,
        removeAuction,
        addParticipantToAuction,
        removeParticipantFromAuction,
        getAuctionWebsockets,
        getAuctionParticipants,
        listOfAuctions
    };
}
