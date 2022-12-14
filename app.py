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
  import urllib.parse
  try:
    tokBytes = urllib.parse.unquote(tok).encode()
    l = fernet.decrypt(tokBytes).decode().split()
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
  p.name = f'Player{p.id}'
  players[p.id] = p
  return p

def getPlayer(id:int):
  global playerCounter
  if id in players:
    return players[id]
  if id >= playerCounter:
    playerCounter = id - 1
  p = addPlayer()
  p.id = id
  return p
  
def getToken(g:Game,p:Player):
  l = f"{g.id} {p.id}"
  return fernet.encrypt(l.encode()).decode()
  
