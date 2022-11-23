from game import Game
from player import Player
import app

def hmConnected(g:Game, p:Player, msg:dict):
    g.send('Connected', {"id":p.id,"name":p.name})

def hmReady(g:Game, p:Player, msg:dict):
    g.send('Token', {"id":app.getToken(g, p)}, p)
