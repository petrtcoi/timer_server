import { Request, Response } from "express"
import { ApiError } from "../../../types/apiError"
import { auctions } from "../auctions/auctionsStore"
import { TimerState } from "../timer/auctionTimer"


type StartRequestParams = {
  auctionId: string
}


const start = async (req: Request<StartRequestParams>, res: Response<TimerState | ApiError>) => {
  const auctionId = req.params.auctionId

  if (!auctionId) {
    res.status(400).send({ error: 'Не указан ID аукциона в запросе' })
    return
  }

  const auction = auctions.getAuction(auctionId)
  res.status(200).send(auction.timer.getData())
}


export default start