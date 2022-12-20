import EventEmmiter from 'events'
import { AuctionId } from '../auctions/auction'
import { auctions } from '../auctions/auctionsStore'

const LOOP_DURATION_SECONDS = 60 * 2
const ONE_SECOND = 1000

export enum TimerStatus {
  Working = 'Working',
  Stopped = 'Stopped'
}
export enum TimerEvents {
  NextSecond = 'NextSecond'
}
export type TimerState = {
  auctionId: AuctionId
  status: TimerStatus,
  loopDurationSeconds: number
  startAt: number,
  secondsPassed: number
}
export type AuctionTimer = {
  getData: () => TimerState
  getSyncData: () => Promise<TimerState>
  drop: () => TimerState
  start: () => TimerState
}


export const getTimer = (auctionId: AuctionId): AuctionTimer => {

  let timerState: TimerState = getInitTimerState(auctionId)
  let timerTimeout: any
  const auctionEvents = new EventEmmiter()
  const emitSecondsPassed = getEmitSecondsPassed(auctionEvents)

  /** Возвращаем данные таймера */
  function getData(): TimerState {
    return timerState
  }

  /** Возвращаем данные таймера в момент обновления счетчика */
  async function getSyncData(): Promise<TimerState> {
    if (timerState.status === TimerStatus.Stopped) return getData()
    await waitForNextSecond(auctionEvents)
    return getData()
  }

  /** Сбрасывает таймер в начальное положение и запускает цикл счетчика секунд */
  function start(): TimerState {
    timerState = { ...getInitTimerState(timerState.auctionId), status: TimerStatus.Working }
    emitSecondsPassed(timerState)
    runTimerLoop()
    return getData()
  }

  /** Останавливает работу таймера, очищает цикл счетчика секунд */
  function dropTimer(): TimerState {
    clearTimeout(timerTimeout)
    timerState = { ...timerState, status: TimerStatus.Stopped }
    return getData()
  }


  /**  Бесконечный цикл отсчета секунд */
  function runTimerLoop() {
    timerTimeout = setTimeout(() => {
      timerState =
        (timerState.secondsPassed < (LOOP_DURATION_SECONDS - 1))
          ? addSecond(timerState)
          : newLoop(timerState)
      emitSecondsPassed(timerState)
      runTimerLoop()
    }, ONE_SECOND)
  }


  return { getData, getSyncData, start, drop: dropTimer }
}



function getInitTimerState(auctionId: AuctionId): TimerState {
  return {
    auctionId,
    status: TimerStatus.Stopped,
    startAt: Date.now(),
    loopDurationSeconds: LOOP_DURATION_SECONDS,
    secondsPassed: 0,
  }
}
function waitForNextSecond(events: EventEmmiter) {
  return new Promise((resolve, _reject) => {
    events.once(TimerEvents.NextSecond, resolve)
  })
}
function addSecond(state: TimerState): TimerState {
  return { ...state, secondsPassed: state.secondsPassed + 1 }
}
function newLoop(state: TimerState): TimerState {
  return { ...state, secondsPassed: 0 }
}

function getEmitSecondsPassed(auctionEvents: EventEmmiter) {
  return function (timerState: TimerState) {
    auctionEvents.emit(TimerEvents.NextSecond, timerState.auctionId, timerState.secondsPassed)
    const wsList = auctions.getAuctionWebsockets(timerState.auctionId)
    wsList.forEach(ws => ws.send(JSON.stringify({ auctionId: timerState.auctionId, seconds: timerState.secondsPassed })))
  }
}

