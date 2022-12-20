import express from 'express'

import deleteTimer from './routrerHandlers/delete'
import get from './routrerHandlers/get'
import inspect from './routrerHandlers/inspect'
import start from './routrerHandlers/start'


const router = express.Router()
router.get('/_inspect_', inspect)
router.get('/:auctionId', get)
router.post('/:auctionId', start)
router.delete('/:auctionId', deleteTimer)

export default router
