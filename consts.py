from enum import Enum

class Res(Enum):
    UNDEF = -1
    FOOD = 0
    ENERGY = 1
    SMITHORE = 2
    CRYSTITE = 3
    LAND = 4

NO_SELL_PRICE = 99999
UNCOMITTED = '_Uncomitted_'

pe = [''] * 22
pe[0]='You just received a package from your home-world relatives containing 3 food and 2 energy units.'
pe[1]='A wandering space traveler repaid your hospitality by leaving two bars of smithore.'
pe[2]='Your mule was judged "best built" at the colony fair. You won ₿?'
pe[3]='Your mule won the colony tap-dancing contest. You collected ₿?.'
pe[4]='The colony council for agriculture awarded you ₿1? for each food plot you have developed. The total grant is ₿2?.'
pe[5]='The colony awarded you ₿? for stopping the wart worm infestation.'
pe[6]='The museum bought your antique personal computer for ₿?.'
pe[7]='You won the colony swamp eel eating contest and collected ₿?. (Yuck!)'
pe[8]='A charity from your home-world took pity on you and sent ₿?.'
pe[9]='Your offworld investments in artificial dumbness paid ₿? in dividends.'
pe[10]='A distant relative died and left you a vast fortune٬ but after taxes you only got ₿?.'
pe[11]='You found a dead moose rat and sold the hide for ₿?.'
pe[12]='You received an extra plot of land to encourage colony development.'
# above are good٬ below are bad
pe[13]='Mischievous glac-elves broke into your storage shed and stole half your food.'
pe[14]='One of your mules lost a bolt. Repairs cost you ₿?.'
pe[15]='Your mining mules have deteriorated from heavy use and cost ₿1? each to repair. The total cost is ₿2?.'
pe[16]='The solar collectors on your energy mules are dirty. Cleaning cost you ₿1? Each for a total of ₿2?.'
pe[17]='Your space gypsy inlaws made a mess of the settlement. It cost you ₿? to clean it up.'
pe[18]='Flying cat-bugs ate the roof off your dwelling. Repairs cost ₿?.'
pe[19]='You lost ₿? betting on the two-legged kazinga races.'
pe[20]='Your child was bitten by a bat lizard and the hospital bill cost you ₿?.'
pe[21]='You lost a plot of land because the claim was not recorded.'

ce = [''] * 9
ce[0] = 'A planetquake reduces mining production!'                              # 15% 3 times max
ce[1] = 'A pest attack on plot ? causes all food to be destroyed!'              # 15% 3 times max
ce[2] = 'Sunspot activity increases energy production!'                         # 15% 3 times max
ce[3] = 'Acid rain increases food production٬ but decreases energy production.' # 15% 3 times max
ce[4] = 'A fire at the settlement destroys all colony-held goods!'              # 10% 2 times max
ce[5] = 'An asteroid smashes into plot ?٬ making a new crystite deposit!'       # 10% 2 times max
ce[6] = 'Space radiation destroys the MULE at plot ?!'                          # 10% 2 times max
ce[7] = 'Space pirates steal all crystite!'                                     # 10% 2 times max

et = {}
et[0] = "Overall٬ the colony failed...dismally. The Federation debtors' prison is your new home!"
et[20000] = "Overall٬ the colony failed...The Federation will no longer send trade ships. You are on your own!"
et[40000] = "Overall٬ the colony survived...barely. You will be living in tents. Few trading ships will come your way!"
et[60000] = "Overall٬ the colony was a success. You have met the minimum standards set by the Federation٬ but your life will not be easy!"
et[80000] = "Overall٬ the colony succeeded. The Federation is pleased by your efforts. You will live comfortably!"
et[100000] = "Overall٬ the colony succeeded...extremely well. You can now retire in elegant estates!"
et[120000] = "Overall٬ the colony delighted the Federation with your exceptional achievement. Your retirement will be luxurious!"
