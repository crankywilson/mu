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


# This message handler sends the initial mandatory stuff needed 
# to get client showing the current state of the game (once web socket is connected)
def hmReady(g:Game, p:Player, msg:dict):
  g.send('Identity', {"id":p.id, "token":app.getToken(g,p)}, p)
  g.send('PlayerState', g.playerState())  # this gets sent to everyone to update connect status
  if g.started:
    g.send('Mounds', {'mounds': g.mounds()}, p)


# This message handler advances the game state once the client indicates
# that the initial mandatory stuff has been processed;  really only used
# for starting the game
def hmSetupComplete(g:Game, p:Player, msg:dict):
  g.send('Plots', {'plots':  g.plotStates()}, p)  # can't send this until textures loaded...

  if g.state == GameState.WAITINGFORALLJOIN and p in g.waitingOn:
    g.waitingOn.remove(p)
  if g.state == GameState.WAITINGFORALLJOIN and len(g.waitingOn) == 0:
    g.state = GameState.WAITFORLANDGRANT
    g.sendState()
    g.addTimerTask(.05, startLandGrant, g)
  else:
    g.sendState(p)

def startLandGrant(g : Game):
  g.state = GameState.LANDGRANT
  g.waitingOn.clear()
  g.waitingOn.extend(g.players)
  g.sendState()
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


def hmPlotRequest(g:Game, p:Player, msg:dict):
  if g.state == GameState.LANDGRANT and p in g.waitingOn:
    g.plots[(msg['x'], msg['y'])].owner = p
    g.send('Plots', {'plots':  g.plotStates()})
    g.send('PlotGranted', {}, p)
    g.waitingOn.remove(p)
    if len(g.waitingOn) == 0:
      g.waitingOn.extend(g.players)
      g.state = GameState.IMPROV
      for p in g.players:
        g.send('PosData', p.posData())
      g.sendState()
