import { UserId } from "../../users/users"
import WebSocket from 'ws'

export type Participant = {
  userId: UserId
  ws: WebSocket 
}