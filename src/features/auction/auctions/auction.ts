import { UserId } from "../../users/users"
import WebSocket from 'ws'
import { AuctionTimer, getTimer } from "../timer/auctionTimer"
import { Participant } from '../participants/participant'

export type AuctionId = string

export type Auction = {
  id: AuctionId,
  timer: AuctionTimer
  participants: Map<UserId, Participant>
  activeWebSockets: WebSocket[]
}

export function getNewAuction(auctionId: AuctionId): Auction {
  return {
    id: auctionId,
    timer: getTimer(auctionId),
    participants: new Map<UserId, Participant>(),
    activeWebSockets: []
  }
}

export function addParticipant(auction: Auction, participant: Participant): Auction {
  const newParticipants = auction.participants.set(participant.userId, participant)
  return {
    ...auction,
    participants:newParticipants,
    activeWebSockets: getActualWebsockets(newParticipants)
  }
}

export function removeParticipant(auction: Auction, userId: UserId): Auction {
  const { participants } = auction
  participants.delete(userId)
  return {
    ...auction,
    participants,
    activeWebSockets: getActualWebsockets(participants)
  }
}

/** Обновляет список актуальных сокетов. Прямое добавление / удаление сокета
 * из массива было бы быстрее. Но операция не должна быть частой
 */
export function getActualWebsockets(participants: Auction["participants"]): WebSocket[] {
  return Array
    .from(participants.values())
    .map(p => p.ws)
    .filter(Boolean) as WebSocket[]
}