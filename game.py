from typing import Tuple, Optional, List, Dict, Set, Callable, Any
from player import Player, NOPLAYER
from plot import Plot
from consts import Res
from asyncio import Future, create_task, Task, sleep
from collections.abc import Coroutine
from collections import deque
import json
import random
from enum import Enum, auto
#import os

msgHandlers = {}

class GameState(Enum):
  WAITINGFORALLJOIN = auto(),
  WAITFORLANDGRANT = auto(),
  LANDGRANT = auto(),
  WAITINGFORLANDAUCTION = auto(),
  LANDAUCTION = auto(),
  WAITINGTOSTARTIMPROV = auto(),
  IMPROV = auto(),
  PROD = auto(),


class Game:
  def __init__(self, id : int):
    self.id = id
    self.started = False
    self.players : List[Player] = []
    self.waitingOn : List[Player] = []
    self.store = NOPLAYER
    self.state = GameState.WAITINGFORALLJOIN
    self.stateParams = []
    self.resourcePrices = [15,10,40,100]
    self.mulePrice = 100
    self.mules = 14
    self.month = 0
    self.taskRefs : Set[Task] = set() # docs say if you don't keep ref, they could get garbage collected unexpectedly...
    self.timerTask : Optional[Task] = None
    self.plots : Dict[Tuple[int, int], Plot] = {}  # key is tuple (e, s) where s in # of units south of the center and e is # east (can be negative)
    self.auctionType = Res.UNDEF

    
    '''
    self.timer = 0.0
    
    self.storeSelling = True  # store doesn't sell in crystite or land, and once sellout occurs in auction, store doesn't sell for rest of auction even if buys
    self.minPrice = 10   # can be raised if store isn't selling
    self.tradeTask : Any = None
    self.buyerConfirmed : Optional[bool] = False
    self.sellerConfirmed : Optional[bool] = False
    
    self.playersRespondedForNextState = set()
    self.numLandAuctionsThisMonth = 0
    self.muleRequests = []
    self.possibleColonyEvents = [0,1,2,3,4,5,6,7,8,0,1,2,3,4,5,6,7,0,1,2,3]
    self.possibleGoodPlayerEvents = list(range(0,13))
    self.possibleBadPlayerEvents = list(range(13,22))
    self.waitingForOtherTraders = False
    self.bidIncr = 1
    '''
    self.incomingMsgs : deque[Tuple[Player, str, Future]] = deque()

    self.store.name = "STORE"

    if len(msgHandlers) == 0 and id >= 0:
      import msgs
      from inspect import getmembers, isfunction 
      for i in getmembers(msgs, isfunction):  #type
        if i[0].startswith('hm'):
          msgHandlers[i[0]]=i[1]

    if id >= 0:
      self.initPlots()


  def addPlayerWithNextAvailChar(self, p : Player):
    self.players.append(p)
    availChars = [1,2,3,4]
    for other in self.players:
      if other.character in availChars:
        availChars.remove(other.character)
    if len(availChars) > 0:
      p.character = availChars[0]


  def playerState(self, client : Optional[Player] = None):
    retVal = {}
    for p in self.players:
      entry = {}
      entry['id'] = p.id
      entry['ipsrc'] = p.ipsrc
      entry['connected'] = p.ws is not None
      entry['name'] = p.name
      entry['character'] = p.character 
      entry['money'] = p.money
      entry['score'] =  p.score
      entry['ranking'] = p.ranking
      retVal[p.id] = entry
    if client is not None:
      retVal['youAre'] = client.id
    return retVal


  def plotStr(self, e : int, s : int):
    k = 'P'
    if e > 0:
      k += 'E'
    elif e < 0:
      k += 'W'
    else:
      k += 'R'
    k += str(abs(e))
    if s >= 0:
      k += 'S'
    else:
      k += 'N'
    k += str(abs(s))
    return k


  def plotKey(self, plotStr : str):
    e = int(plotStr[2])
    if plotStr[1] == 'W':
      e = -e
    s = int(plotStr[4])
    if plotStr[1] == 'N':
      s = -s
    return (e,s)


  def plotStates(self):
    retVal = {}
    for pk, pv in self.plots.items():
      retVal[self.plotStr(pk[0], pk[1])] = {
        'ownerChar': pv.owner.character if pv.owner is not NOPLAYER else 0,
        'res': pv.resource.value
      }
    return retVal

  
  # not written for thread safety (incomingMsgs not locked) -- assumes only asyncio is being used with this method, eg method is atomic
  def processIncomingMsg(self, itm : Tuple[Player, str, Future]):
    if itm is not self.incomingMsgs[0]:
      raise Exception("incoming msg list has gotten out-of-sync")

    p = itm[0]
    msg = json.loads(itm[1])
    msgType = msg['msg']
    func = 'hm' + msgType
    if func in msgHandlers:
      msgHandlers[func](self, p, msg)
    else:
      print(f"Unkown message {msgType} received from {p.id}")

    self.incomingMsgs.popleft()

    if self.incomingMsgs:
      nextMsgIsAtHead_FutureObj = self.incomingMsgs[0][2]
      nextMsgIsAtHead_FutureObj.set_result(True)


  def send(self, msgType:str, vals:Optional[Dict]=None, p:Optional[Player]=None):
    recips = self.players if p is None else [p]
    d = {"msg":msgType}
    if vals is not None:
      d.update(vals)
    msg = json.dumps(d)
    print(f'SEND {p.id if p is not None else "A"} {msg[0:69]}')
    for r in recips:
      if r.ws is not None:
        self.addBackgroundTask(r.ws.send(msg))


  def sendState(self, p:Optional[Player]=None):
    self.send('GameState', {
      'state': self.state.name,
      'awaiting': [p.id for p in self.waitingOn]
    }, p)


  def addBackgroundTask(self, coro : Coroutine):
    task = create_task(coro)
    self.taskRefs.add(task)
    task.add_done_callback(self.taskRefs.discard)


  # this should only be called via addTimerTask
  async def _timedCallback(self, secs : float, fn : Callable[[Any], None], param : Any = None):
    t = self.timerTask
    await sleep(secs)
    if t is self.timerTask:
      self.timerTask = None
      fn(param)
    else:
      print("timer task got unsychronized")


  def addTimerTask(self, secs : float, fn : Callable[[Any], None], param : Any = None):
    if self.timerTask is not None:
      raise Exception('Already an existing timer reference task...')

    self.timerTask = create_task(self._timedCallback(secs, fn, param))


  def cancelTimerTask(self):
    if self.timerTask is not None:
      self.timerTask.cancel()
      self.timerTask = None


  def assignCrystitie(self, r, c, lvl):
    if self.plots[(c,r)].assay < lvl:
      self.plots[(c,r)].assay = lvl
    if lvl > 1:
      if r > -2:
        self.assignCrystitie(r-1, c, lvl-1)
      if r < 2:
        self.assignCrystitie(r+1, c, lvl-1)
      if c > -4:
        self.assignCrystitie(r, c-1, lvl-1)
      if c < 4:
        self.assignCrystitie(r, c+1, lvl-1)


  def initPlots(self):
    availMoundPlots = []
    availHCPlots = []
    
    for row in range(-2,3):
      for col in range(-4,5):
        k = (col,row)
        self.plots[k] = Plot()
        if col != 0:
          availMoundPlots.append(k)
        availHCPlots.append(k)

    for i in range(9):
      k = availMoundPlots[random.randrange(0,len(availMoundPlots))]
      availMoundPlots.remove(k)
      self.plots[k].mounds = (int(i/3)+1)
      x = k[0]
      z = k[1]
      for j in range(self.plots[k].mounds):
        l = [
          x * 4 - 1.6 + random.random()*3.2,
          random.random()*6.28,
          z * 4 - 1.6 + random.random()*3.2,
          .2 + (random.random() - .2) / 4,
          .2 + (random.random() / 3),
          .2 + (random.random() - .2) / 4
        ]
        self.plots[k].moundGeom.append(l)

    for i in range(3):
      (c, r) = availHCPlots[random.randrange(0,len(availHCPlots))]
      availHCPlots.remove((c, r))
      self.assignCrystitie(r, c, 3)

    print(f"Game {self.id} Crystite:")
    for row in range(-2,3):
      print([self.plots[col,row].assay for col in range(-4,5)])
    print()

    print(f"Game {self.id} Smithore:")
    for row in range(-2,3):
      print([self.plots[col,row].mounds for col in range(-4,5)])
    print()

    #for k, plot in self.plots.items():
    #  if len(plot.moundGeom) > 0:
    #    print(str(k) + ':        ' + (os.linesep + '  ').join(map(str,plot.moundGeom)))


  def mounds(self):
    mounds = []
    for k, plot in self.plots.items():
      for mound in plot.moundGeom:
        mounds.append(mound)
    return mounds


UNASSIGNED = Game(-1)

