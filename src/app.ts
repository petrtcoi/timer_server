import express, { Express } from 'express'
import cors from 'cors'
import { dotenvConfig } from './env.config'

import auctionRouter from './features/auction/router'


dotenvConfig()
Object.freeze(Object.prototype)
const app: Express = express()


// MIDDLEWARE
app.use(cors())

// ROUTERS
app.use('/auction', auctionRouter)
app.get('/', (_, res) => {
  res.status(200).send('Im alive')
})



export default app