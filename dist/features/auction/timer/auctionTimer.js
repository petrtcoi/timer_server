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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimer = exports.TimerEvents = exports.TimerStatus = void 0;
const events_1 = __importDefault(require("events"));
const auctionsStore_1 = require("../auctions/auctionsStore");
const LOOP_DURATION_SECONDS = 60 * 2;
const ONE_SECOND = 1000;
var TimerStatus;
(function (TimerStatus) {
    TimerStatus["Working"] = "Working";
    TimerStatus["Stopped"] = "Stopped";
})(TimerStatus = exports.TimerStatus || (exports.TimerStatus = {}));
var TimerEvents;
(function (TimerEvents) {
    TimerEvents["NextSecond"] = "NextSecond";
})(TimerEvents = exports.TimerEvents || (exports.TimerEvents = {}));
const getTimer = (auctionId) => {
    let timerState = getInitTimerState(auctionId);
    let timerTimeout;
    const auctionEvents = new events_1.default();
    const emitSecondsPassed = getEmitSecondsPassed(auctionEvents);
    /** Возвращаем данные таймера */
    function getData() {
        return timerState;
    }
    /** Возвращаем данные таймера в момент обновления счетчика */
    function getSyncData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (timerState.status === TimerStatus.Stopped)
                return getData();
            yield waitForNextSecond(auctionEvents);
            return getData();
        });
    }
    /** Сбрасывает таймер в начальное положение и запускает цикл счетчика секунд */
    function start() {
        timerState = Object.assign(Object.assign({}, getInitTimerState(timerState.auctionId)), { status: TimerStatus.Working });
        emitSecondsPassed(timerState);
        runTimerLoop();
        return getData();
    }
    /** Останавливает работу таймера, очищает цикл счетчика секунд */
    function dropTimer() {
        clearTimeout(timerTimeout);
        timerState = Object.assign(Object.assign({}, timerState), { status: TimerStatus.Stopped });
        return getData();
    }
    /**  Бесконечный цикл отсчета секунд */
    function runTimerLoop() {
        timerTimeout = setTimeout(() => {
            timerState =
                (timerState.secondsPassed < (LOOP_DURATION_SECONDS - 1))
                    ? addSecond(timerState)
                    : newLoop(timerState);
            emitSecondsPassed(timerState);
            runTimerLoop();
        }, ONE_SECOND);
    }
    return { getData, getSyncData, start, drop: dropTimer };
};
exports.getTimer = getTimer;
function getInitTimerState(auctionId) {
    return {
        auctionId,
        status: TimerStatus.Stopped,
        startAt: Date.now(),
        loopDurationSeconds: LOOP_DURATION_SECONDS,
        secondsPassed: 0,
    };
}
function waitForNextSecond(events) {
    return new Promise((resolve, _reject) => {
        events.once(TimerEvents.NextSecond, resolve);
    });
}
function addSecond(state) {
    return Object.assign(Object.assign({}, state), { secondsPassed: state.secondsPassed + 1 });
}
function newLoop(state) {
    return Object.assign(Object.assign({}, state), { secondsPassed: 0 });
}
function getEmitSecondsPassed(auctionEvents) {
    return function (timerState) {
        auctionEvents.emit(TimerEvents.NextSecond, timerState.auctionId, timerState.secondsPassed);
        const wsList = auctionsStore_1.auctions.getAuctionWebsockets(timerState.auctionId);
        wsList.forEach(ws => ws.send(JSON.stringify({ auctionId: timerState.auctionId, seconds: timerState.secondsPassed })));
    };
}
