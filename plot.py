from player import NOPLAYER
from consts import Res

class Plot:
  def __init__(self):
    self.owner = NOPLAYER
    self.resource = Res.UNDEF
    self.mounds = 0
    self.moundGeom = []
    self.assay = 0
    self.prod = 0
