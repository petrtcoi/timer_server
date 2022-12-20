import app from './app'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { Server, WebSocket } from 'ws'
import { parse } from 'url'

import wssAuction from './features/auction/websocket'


const port = process.env.PORT
const mode = process.env.MODE


const httpServer = http.createServer(app)
  .listen(80, () => {
    console.log(`⚡️HTTP[server]: Server is running at https://localhost:80. Mode: ${mode}`)
  })
const httpsServer = https.createServer({
  key: fs.readFileSync(path.resolve('./src/config/key.pem')),
  cert: fs.readFileSync(path.resolve('./src/config/cert.pem')),
  passphrase: 'helloworld'
}, app)
  .listen(443, () => {
    console.log(`⚡️HTTPS[server]: Server is running at https://localhost:443. Mode: ${mode}`)
  })

export const wss = wssAuction(httpServer as unknown as Server<WebSocket>)

httpsServer.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request?.url || '')
  if (pathname === '/auction') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})
