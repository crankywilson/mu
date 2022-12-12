from game import Game, GameState, UNASSIGNED
from player import Player, NOPLAYER
import app


def hmConnected(g:Game, p:Player, msg:dict):
  # here we will just assign player to the only game
  if g is UNASSIGNED:
    app.games[1].addPlayerWithNextAvailChar(p)
    p.switchedGames = True


def hmDisconnected(g:Game, p:Player, msg:dict):
  g.send('Disconnected', {"id":p.id,"name":p.name})


def hmReady(g:Game, p:Player, msg:dict):
  g.send('Identity', {"id":p.id, "token":app.getToken(g,p)}, p)
  g.send('PlayerState', g.playerState())
  if g.started:
    g.send('Mounds', g.mounds(), p)


def hmSetupComplete(g:Game, p:Player, msg:dict):
  if g.state == GameState.WAITINGFORALLJOIN and p in g.waitingOn:
    g.waitingOn.remove(p)
  if len(g.waitingOn) == 0:
    g.state = GameState.WAITFORLANDGRANT
    g.send('WAITFORLANDGRANT')
    g.addTimerTask(5, startLandGrant, g)


def startLandGrant(g : Game):
  g.state = GameState.LANDGRANT
  g.send('STARTLANDGRANT')
  g.addTimerTask(30, landGrantTimeUp, g)


def landGrantTimeUp(g : Game):
  pass


def hmNameChange(g:Game, p:Player, msg:dict):
  p.name = msg['name']
  g.send('PlayerState', g.playerState())


def hmCharacterChange(g:Game, p:Player, msg:dict):
  newChar = msg['character']
  for p in g.players:
    if p.character == newChar:
      return
  if newChar < 1 or newChar > 4:
    return
  p.character = newChar
  g.send('PlayerState', g.playerState())


def hmStart(g:Game, p:Player, msg:dict):
  g.started = True
  g.waitingOn.extend(g.players)
  g.send('Start')


