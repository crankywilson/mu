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
  console.log('Got: ' + event.data)

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
function hmIdentity(m)
{
  myID = m.id;
}

leftPositions = [[],[42.5],[30,55],[10,42.5,75],[5,30,55,80]];
colorsForChar = ['','rgba(255, 0, 0, 0.2)','rgba(255, 255, 0, 0.2)','rgba(0, 255, 0, 0.2)','rgba(0, 0, 255, 0.2)'];
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
      fbxLoader.load('models/' + modelNames[p.character] + '.fbx', fbxloaded, n, n); 
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
function hmWAITFORLANDGRANT(m)
{
  e("msg").innerText = 'Land grant will begin in about 5 seconds.'
  prepSound.play();
}


function hmSTARTLANDGRANT(m)
{
  e("msg").innerText = 'Land grant:  Click on an available plot to claim.  (Land grant ends in about 30 seconds)'
  state = st.LANDGRANT;
  notSound.play();
}
