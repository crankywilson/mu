from typing import Optional
import websockets.server

class Player:
  def __init__(self):
    self.id = 0    # global ID across all games - only client should be app.addPlayer
    self.ipsrc = 'Unknown'
    self.ws : Optional[websockets.server.WebSocketServerProtocol] = None
    self.name : Optional[str] = None
    self.character = 0
    self.score = 0
    self.ranking = 1
    self.money = 1000
    self.resources = [3,2,0,0]
    self.production = [0,0,0,0]
    self.switchedGames = False   # set this to update websocket processing

    self.pos = [0.0, 0.0]
    self.dest = [0.0, 0.0]
    self.speed = 0
    self.muleFollowing = False
    self.mulepos = [0.0, 0.0]
    self.muledest = [0.0, 0.0]
    self.muletype = -1

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

  def posData(self):
    return {
      'pos': self.pos,
      'dest': self.dest,
      'speed': self.speed,
      'muleFollowing': self.muleFollowing,
      'mulepos': self.mulepos,
      'muledest': self.muledest,
      'muletype': self.muletype 
    }


NOPLAYER = Player()

