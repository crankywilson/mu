from typing import Optional
import websockets.server

class Player:
  def __init__(self):
    self.id = 0
    self.ws : Optional[websockets.server.WebSocketServerProtocol] = None
    self.name : Optional[str] = None    # once this name changes, player cannot be re-assigned
    self.species = 0
    self.color = 0
    self.score = 0
    self.ranking = 1
    self.money = 1000
    self.resources = [3,2,0,0]
    self.production = [0,0,0,0]
    self.slot = 1

    #auction state vals
    self.criticalLevel = 0
    self.buying = True
    self.ask = 0
    self.bid = 0
    self.awaitingBid = False
    self.tradeStartTime : Optional[float] = None   # reset with every bid change (including auction start) and when mule/plot is obtained (or not due to rating)
    self.immediateBidUntil : Optional[float] = None
    self.immediateBidRange : Optional[range] = None
    self.activelyTrading = False

NOPLAYER = Player()

