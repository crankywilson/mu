from game import Game, UNASSIGNED
from cryptography.fernet import Fernet
from player import Player
from typing import Dict

stopRequested = False
fernet = Fernet(Fernet.generate_key())
games = {1: Game(1)}
players : Dict[int, Player] = {}
playerCounter = 0

def playerAndGameForToken(tok:str):
  try:
    l = fernet.decrypt(tok).decode().split()
    gid = int(l[0])
    pid = int(l[1])
    g = games[gid] if gid in games else None
    p = players[pid] if pid in players else None
    if g is not None and p is not None and p in g.players:
      return p, g
    return None, UNASSIGNED
  except:
    return None, UNASSIGNED

def addPlayer():
  global playerCounter
  playerCounter += 1
  p = Player()
  p.id = playerCounter
  players[p.id] = p
  return p

def getPlayer(id:int):
  global playerCounter
  if id in players:
    return players[id]
  if id >= playerCounter:
    playerCounter = id - 1
  return addPlayer()
  
def getToken(g:Game,p:Player):
  l = f"{g.id} {p.id}"
  return fernet.encrypt(l.encode())
  
