import { Request, Response } from "express"
import { auctions } from "./../auctions/auctionsStore"





const inspect = async (_req: Request, res: Response) => {

  const auctionsList = auctions.listOfAuctions()
  const report  = auctionsList.map(auction => {
    return {
      id: auction.id,
      timer: auction.timer.getData(),
      websockets: auction.activeWebSockets.length,
      participants: Array.from(auction.participants.values()).map(x => x.userId)
    }
  })
  res.status(200).send(report)
}


export default inspect