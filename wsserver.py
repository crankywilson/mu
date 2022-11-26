#from __future__ import annotations
import websockets.server
import asyncio
import app
from   typing import Optional
from player import Player
from game import Game, UNASSIGNED



async def newConnection(ws:websockets.server.WebSocketServerProtocol, path:str):
  print(f"New ws connection from {ws.host}: {path}")
  p, g = getPlayerAndGame(ws, path)

  await processMsg(ws, '{"msg":"Connected"}', p, g)

  async for msg in ws:
    if type(msg) is str:
      await messageReceived(ws, msg, p, g)

  p.ws = None

  await connectionClosed(ws, p, g)
 

async def messageReceived(ws:websockets.server.WebSocketServerProtocol, msg:str, p:Player, g:Game):
  await processMsg(ws, msg, p, g)


async def connectionClosed(ws:websockets.server.WebSocketServerProtocol, p:Player, g:Game):
  await processMsg(ws, '{"msg":"Disconnected"}', p, g) 


def getPlayerAndGame(ws:websockets.server.WebSocketServerProtocol, path:str):
  p = None
  g = UNASSIGNED
  if path.find("?z="):
    try:
      p = app.getPlayer(int(path.split('=')[1]))
    except:
      pass

  if p is None and path.find("?tok="):
    try:
      p, g = app.playerAndGameForToken(path.split('=')[1])
    except:
      pass

  if p is None:
    p = app.addPlayer()

  p.ws = ws
  return p, g


async def processMsg(ws:websockets.server.WebSocketServerProtocol, msg:str, p:Player, g:Game):
  msgIsAtHead = asyncio.Future()

  qitem = (p, msg, msgIsAtHead)
  g.incomingMsgs.append(qitem)
  if g.incomingMsgs[0] is not qitem:
    await msgIsAtHead

  # now qitem should be head of g.incomingMsgs
  g.processIncomingMsg(qitem)

  # give tasks created (ie socket sends) a chance to run before processing next message
  await asyncio.sleep(0)


eventLoop : Optional[asyncio.AbstractEventLoop] = None

async def _start(port:int):
  global eventLoop
  eventLoop = asyncio.get_event_loop()

  async with await websockets.server.serve(newConnection, "0.0.0.0", port):
    print(f"WS Server listening on port {port}")
    await asyncio.Future()  # run forever


def start(port:int, stopPort:int):
  try:
    asyncio.run(_start(port))

  except KeyboardInterrupt:
    import urllib.request
    if eventLoop is not None:
      eventLoop.close()
    app.stopRequested = True
    try:
      urllib.request.urlopen(f"http://localhost:{stopPort}/stop")
    except:
      pass
    print()
    print("Exiting due to KeyboardInterrupt")
