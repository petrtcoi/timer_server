import { Auction, AuctionId, getNewAuction, addParticipant, removeParticipant, getActualWebsockets } from './auction'
import { JustResult, ResultType } from '../../../types/result'
import { Participant } from '../participants/participant'
import { UserId } from '../../users/users'
import WebSocket from 'ws'

type AuctionsStore = {
  getAuction: (auctionId: AuctionId) => Auction
  removeAuction: (auctionId: AuctionId) => JustResult
  addParticipantToAuction: (auctionId: AuctionId, participant: Participant) => JustResult
  removeParticipantFromAuction: (auctionId: AuctionId, userId: UserId) => JustResult
  getAuctionWebsockets: (auctionId: AuctionId) => WebSocket[]
  getAuctionParticipants: (auctionId: AuctionId) => UserId[]
  listOfAuctions: () => Auction[]
}

export const auctions = auctionsStoreFactory().init()


function auctionsStoreFactory() {
  let instance: AuctionsStore
  return {
    init: () => {
      if (!instance) instance = _auctionsStore()
      return instance
    }
  }
}


function _auctionsStore() {
  let auctionsList = new Map<AuctionId, Auction>()

  /**
   *  Проверяет, создан ли уже такой аукцион. Возвращает его.
   *  Логика, что делать, если таймера / аукциона не существует, здесь опущена. Просто создаем новый аукцион
   */
  function getAuction(auctionId: string): Auction {
    const oldAuction = auctionsList.get(auctionId)
    if (oldAuction !== undefined) {
      return oldAuction
    }
    const newAuction = getNewAuction(auctionId)
    newAuction.timer.start()
    auctionsList.set(auctionId, newAuction)
    return newAuction
  }

  /**
  *  Просто сбрасываем таймеры и удаляем аукцион из хранилища
  */
  function removeAuction(auctionId: string): JustResult {
    const oldAuction = auctionsList.get(auctionId)
    if (oldAuction !== undefined) oldAuction.timer.drop()
    auctionsList.delete(auctionId)
    return ResultType.Ok
  }

  /** Добавляем участника в аукцион */
  function addParticipantToAuction(auctionId: AuctionId, participant: Participant): JustResult {
    const auction = auctionsList.get(auctionId)
    if (!auction) return ResultType.Error

    auctionsList.set(auctionId, addParticipant(auction, participant))
    return ResultType.Ok
  }

  /** Удаляем участника из аукциона */
  function removeParticipantFromAuction(auctionId: AuctionId, userId: UserId): JustResult {
    const auction = auctionsList.get(auctionId)
    if (!auction) return ResultType.Error

    const ws = auction.participants.get(userId)?.ws
    if (ws) ws.close()
    auctionsList.set(auctionId, removeParticipant(auction, userId))

    return ResultType.Ok
  }

  /** Получаем список websocket для уведомлений */
  function getAuctionWebsockets(auctionId: AuctionId): WebSocket[] {
    const auction = auctionsList.get(auctionId)
    if (!auction) return []
    return auction.activeWebSockets
  }


  /** Получаем список пользователей */
  function getAuctionParticipants(auctionId: AuctionId): UserId[] {
    const auction = auctionsList.get(auctionId)
    if (!auction) return []
    return Array.from(auction.participants.values()).map(x => x.userId)
  }

  /** Список всех аукционов */
  function listOfAuctions(): Auction[] {
    return Array.from(auctionsList.values())
  }


  return {
    getAuction,
    removeAuction,
    addParticipantToAuction,
    removeParticipantFromAuction,
    getAuctionWebsockets,
    getAuctionParticipants,
    listOfAuctions
  }

}


