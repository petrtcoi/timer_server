import { Server, WebSocket } from "ws"
import { auctions } from './auctions/auctionsStore'


const wsClients = new WeakMap<WebSocket, { isAlive: boolean }>


export enum MessageType {
  SubscribeAuction = 'SubscribeAuction',
  LeaveAuction = 'LeaveAuction'
}
export type SubscribeMessage = { type: string, auctionId: string }


export default function (server: Server) {
  const wss = new WebSocket.Server({ noServer: true })

  wss.on('connection', function connection(ws) {

    /** Очистка от "мертвых" соединений (см ниже setInterval) */
    wsClients.set(ws, { isAlive: true })
    ws.on('pong', () => wsClients.set(ws, { isAlive: true }))


    /** Обработка входящих сообщений */
    ws.on('message', function message(data) {
      const wsd: WebSocket = ws
      const { type, auctionId, userId } = JSON.parse(data as unknown as string)
      if (!type || !auctionId || !userId) return

      switch (type) {
        case MessageType.SubscribeAuction:
          auctions.addParticipantToAuction(auctionId, { userId, ws: wsd })
          break
        case MessageType.LeaveAuction:
          auctions.removeParticipantFromAuction(auctionId, userId)
          break
      }
    })


  })

  setInterval(() => {
    wss.clients.forEach(ws => {
      const savedWs = wsClients.get(ws)
      if (!savedWs || savedWs.isAlive === false) {
        wsClients.delete(ws)
        ws.terminate()
        return
      }
      wsClients.set(ws, { isAlive: false })
      ws.ping()
    })
  }, 10000)



  return wss
}


