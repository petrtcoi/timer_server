import { Request, Response } from "express"
import { auctions } from "./../auctions/auctionsStore"

import { ApiError } from "../../../types/apiError"
import { TimerState } from "../timer/auctionTimer"
import { UserId } from "../../users/users"



type GetRequestParams = {
  auctionId: string
}



const get = async (req: Request<GetRequestParams>, res: Response<TimerState & {participants: UserId[]} | ApiError>) => {
  const auctionId = req.params.auctionId

  if (!auctionId) {
    res.status(400).send({ error: 'Не указан ID аукциона в запросе' })
    return
  }
  const auction = auctions.getAuction(auctionId)
  const participants = auctions.getAuctionParticipants(auctionId)
  const timer = await auction.timer.getSyncData()

  res.status(200).send({...timer, participants})
}


export default get