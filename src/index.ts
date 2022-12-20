import app from './app'
import { Server, WebSocket } from 'ws'
import { parse } from 'url'

import wssAuction from './features/auction/websocket'


const port = process.env.PORT
const mode = process.env.MODE

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}. Mode: ${mode}`)
})

export const wss = wssAuction(server as unknown as Server<WebSocket>)

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request?.url || '')
  if (pathname === '/auction') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})
