"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auctionsStore_1 = require("./../auctions/auctionsStore");
const inspect = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const auctionsList = auctionsStore_1.auctions.listOfAuctions();
    const report = auctionsList.map(auction => {
        return {
            id: auction.id,
            timer: auction.timer.getData(),
            websockets: auction.activeWebSockets.length,
            participants: Array.from(auction.participants.values()).map(x => x.userId)
        };
    });
    res.status(200).send(report);
});
exports.default = inspect;
