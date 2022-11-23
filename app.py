from game import Game
from cryptography.fernet import Fernet
from player import Player
from typing import Dict

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
    return p, g
  except:
    return None, None

def addPlayer():
  g = games[next(iter(games))]
  if g.started or len(g.players) >= 4:
    return None, None
  global playerCounter
  playerCounter += 1
  p = Player()
  p.id = playerCounter
  players[p.id] = p
  return p, g

def getToken(g:Game,p:Player):
  l = f"{g.id} {p.id}"
  return fernet.encrypt(l.encode())
  
