#from __future__ import annotations
import websockets.server
import asyncio
import app
from   typing import TYPE_CHECKING


#if TYPE_CHECKING:
from player import Player
from game import Game



async def newConnection(ws:websockets.server.WebSocketServerProtocol, path:str):
  print(f"New ws connection from {ws.host}: {path}")
  tok = path.split('=')[1] if path.find('=') > 0 else '?'
  p, g = app.playerAndGameForToken(tok)
  
  if p is None or g is None:
    p, g = app.addPlayer()

  if p is None or g is None:
    print(f"bad connection token processed: {tok}")
    return

  p.ws = ws

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


eventLoop = None

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
    eventLoop.close()
    app.stopRequested = True
    try:
      urllib.request.urlopen(f"http://localhost:{stopPort}/stop")
    except:
      pass
    print()
    print("Exiting due to KeyboardInterrupt")
