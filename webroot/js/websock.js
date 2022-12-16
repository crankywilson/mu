socket = null;

function setupWebsock() {
  if (location.hostname == '')
  {
    alert("Run this page through localhost to work with websocket.");
    return;
  }

  if (performance.getEntriesByType("navigation")[0].type == "back_forward")
  {
    location.reload();
    return;
  }

  socketURL = 'wss://' + location.hostname + '/wss';
  if (location.port == 8000)
    socketURL = 'ws://' + location.hostname + ':8001/';
  if (location.search.length > 0)
    socketURL += location.search;
  else if (document.cookie.length > 0)
    socketURL += '?' + document.cookie;
  socket = new WebSocket(socketURL);
  socket.addEventListener('message', sockMessage);
  socket.onerror = function (event) { alert("Websocket error!  Press Ctrl+Shift+R when resolved."); }
  socket.onopen = websocketOpened;
}


function websocketOpened(event)
{
  socket.send(JSON.stringify({msg: "Ready"}));
}


pendingMessages = []  // queue up newer messages
function sockMessage(event)
{
  console.log('Got: ' + event.data.substring(0,20))

  // don't process new message until all older ones have had processing completed
  pendingMessages.push(event.data);
  if (pendingMessages.length > 1)
    return;

  while (pendingMessages.length > 0)
  {
      let m = pendingMessages[0];
      let o = JSON.parse(m);
      fname = ('hm' + o.msg);
      if (fname in window && typeof(window[fname]) == "function")
        window[fname](o);
    
    pendingMessages.splice(0,1);  // splice(0,1) == pop first element
  }
}


myID = -1;
myChar = -1;
function hmIdentity(m)
{
  myID = m.id;
}

leftPositions = [[],[42.5],[30,55],[10,42.5,75],[5,30,55,80]];
colorsForChar = ['','rgba(255, 0, 0, 0.2)','rgba(255, 255, 0, 0.2)','rgba(0, 255, 0, 0.2)','rgba(0, 0, 255, 0.2)'];
colorStr = ['','#ff0000','#ffff00','#00ff00','#0000ff'];
modelNames = ['','red','yellow','green','blue'];
plbox = null;
scores = {}
function hmPlayerState(m)
{
  let numPlayers = Object.keys(m).length - 1;
  for (i=numPlayers+1; i<5; i++)
    e('p' + i).style.display = 'none';

  if (plbox == null)
  {
    const fbxLoader = new FBXLoader();
    plbox = {};
    let num=0;
    for (i in m)
    {
      if (i == 'msg')
        continue;
      num++;
      p = m[i];
      plbox[p.id] = e('p' + num);
      plbox[p.id].style.left = leftPositions[numPlayers][num-1]+'%';

      totalModels++;
      fbxLoader.load('models/' + modelNames[p.character] + '.fbx', fbxloaded, prog, n); 
    }
    totalCalculated = true;
  }
  
  for (i in m)
  {
    if (i == 'msg')
      continue;
    let p = m[i];
    let pb = plbox[p.id];
    let spans = pb.getElementsByTagName('span');
    spans[0].innerText = p.name;
    spans[1].innerText = p.money;
    if (!p.connected) 
      spans[2].innerText = '(DISCONNECTED)';
    else if (spans[2].innerText == '(DISCONNECTED)')
      spans[2].innerText = '';
    pb.style.backgroundColor = colorsForChar[p.character];
    scores[p.id] = p.score;

    if (p.id == myID)
    {
      myChar = p.character;
    }
  }
}

function hmMounds(m)
{
  const moundMat = new THREE.MeshBasicMaterial( { color: 0x847463 } );
  for (let d of m['mounds'])
  {
    const geometry = new THREE.SphereGeometry( 1 );
    const sphere = new THREE.Mesh( geometry, moundMat );
    scene.add( sphere );
    sphere.position.set(d[0],0,d[2]);
    sphere.scale.set(d[3], d[4], d[5]);
    sphere.rotation.y = d[1];
  }
}


prepSound = (new Audio("/sound/prep.wav"));
notSound = (new Audio("/sound/not.wav"));

function hmGameState(m)
{
  awaiting = m.awaiting;
  switch (m.state)
  {
    case 'WAITFORLANDGRANT':
      state = st.WAITFORLANDGRANT;
      e("msg").innerText = 'Land grant will begin in about 5 seconds.'
      prepSound.play();
      break;
    case 'LANDGRANT':
      state = st.LANDGRANT;
      e("msg").innerText = 'Land grant:  Click on an available plot to claim.  (Land grant ends in about 30 seconds)'
      if (awaiting.indexOf(myID) == -1) hmPlotGranted(null);
      notSound.play();
      mouseMove(null);
      break;
  }
}


function hmPlots(m)
{
  for (k in m.plots)
  {
    if (!(k in plots))
    {
      let newPlot = {
        ownerChar: 0,
        res: -1,
        flag: null,
        pole: null,
        lines: [],
        rsrc3d: null
      };
      plots[k] = newPlot;
    }

    if (plots[k].ownerChar != m.plots[k].ownerChar)
    {
      if (plots[k].ownerChar > 0)
      {
        // remove flag, lines
      }
      plots[k].ownerChar = m.plots[k].ownerChar;
      if (plots[k].ownerChar > 0)
      {
        let f = flagb.clone();
        let mixer = new THREE.AnimationMixer(f);
        let action = mixer.clipAction(flagAnim);
        action.play();
        scene.add(f);
        flags.push({scene:f, mixer:mixer})

        function updateTexture(child)
        {
          if (child instanceof THREE.Mesh) {
            child.material.map = flagTexture[plots[k].ownerChar];
          }
        }
        f.traverse(updateTexture);
        let es = strToPlot(k);
        f.position.set(es[0] * 4 - 1, 1.5, es[1] * 4);
        let poleGeom = new THREE.CylinderGeometry(.04, .05, 1.8);
        plots[k].pole = new THREE.Mesh( poleGeom, flagPoleMat );
        plots[k].pole.position.set(es[0] * 4 - 1.35, .9, es[1] * 4);
        scene.add(plots[k].pole);
        plots[k].flag = f;

        let ltg = new THREE.BoxGeometry(4, .01, .1);
        let ltm = new THREE.Mesh( ltg, plotboundMat[plots[k].ownerChar] );
        ltm.position.set(es[0]*4, 0, es[1]*4 - 1.95);
        scene.add(ltm);
        plots[k].lines.push(ltm);
        let lbm = ltm.clone();
        lbm.position.set(es[0]*4, 0, es[1]*4 + 1.95);
        scene.add(lbm);
        plots[k].lines.push(lbm);
        let llg = new  THREE.BoxGeometry(.1, .01, 4);
        let llm = new THREE.Mesh( llg, plotboundMat[plots[k].ownerChar] );
        llm.position.set(es[0]*4 - 1.95, 0, es[1]*4);
        scene.add(llm);
        plots[k].lines.push(llm);
        let lrm = llm.clone();
        lrm.position.set(es[0]*4 + 1.95, 0, es[1]*4);
        scene.add(lrm);
        plots[k].lines.push(lrm);
      }
    }

    if (plots[k].res != m.plots[k].res)
    {
      if (plots[k].res > -1)
      {
        // remove rsrc3d
      }
      plots[k].res = m.plots[k].res;
      if (plots[k].res > 0)
      {
        // add rsrc3d
      }
    }
  }
  // ok here we need to check the diff between what we had and incoming
  // put 3d objs as needed...
/*


  */
}


function hmPlotGranted(m)
{
  plotOverlay.material.color.set('#ffffff');
  scene.remove(plotOverlay);
  let ind = awaiting.indexOf(myID);
  if (ind > -1)
    awaiting.splice(ind, 1);
  e("msg").innerText = 'Plot Granted.  (Waiting for other players)';
}

