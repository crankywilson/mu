const st = {
  WAITINGFORALLJOIN: 'WAITINGFORALLJOIN',
  WAITFORLANDGRANT: 'WAITFORLANDGRANT',
  LANDGRANT: 'LANDGRANT',
  MOVEPLAYER: 'MOVEPLAYER',
  SETTLEMENT: 'SETTLEMENT',
  LANDAUCTION_SHOW: 'LANDAUCTION_SHOW',
  TRANSITION_TO_SETTLEMENT: 'TRANSITION_TO_SETTLEMENT',
  TRANSITION_OUT_STLMNT: 'TRANSITION_OUT_STLMNT'
};

state = st.WAITINGFORALLJOIN;

class Player 
{
  constructor() 
  {
    this.model = null;
    this.mixer = null;
    this.dest = null;
    this.speed = 2;
    this.mule = null;
    this.mdest = null;
    this.mspd = null;
    this.money = 1000;
  }
}

pl = [null, new Player(), new Player(), new Player(), new Player()];
plots = {};
flags = [];
awaiting = [];
transpGray = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, transparent: true, opacity: .5 });
plotOverlay = new THREE.Mesh(new THREE.PlaneGeometry(4, 4, 1, 1), transpGray);
plotOverlay.rotation.x = -90 * Math.PI / 180;


function setupComplete() {
  e("msg").innerText = "Setup complete";
  socket.send(JSON.stringify({ msg: "SetupComplete" }));
  requestAnimationFrame(animate);
}

_viewProjectionMatrix = new THREE.Matrix4();
function unprojectVector(vector, camera) {
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  _viewProjectionMatrix.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse);
  return vector.applyMatrix4(_viewProjectionMatrix);
}

_plotCoord = new THREE.Vector2();
function getPlotForMouse(x, y) {
  var pos = new THREE.Vector3(0, 0, 0);
  var pMouse = new THREE.Vector3(
    (x / renderer.domElement.width) * 2 - 1,
    -(y / renderer.domElement.height) * 2 + 1,
    1
  );

  unprojectVector(pMouse, camera);

  var cam = camera.position;
  var m = pMouse.y / (pMouse.y - cam.y);

  pos.x = pMouse.x + (cam.x - pMouse.x) * m;
  pos.z = pMouse.z + (cam.z - pMouse.z) * m;


  _plotCoord.x = (Math.floor((pos.x + 18) / 4) - 4);
  _plotCoord.y = -(Math.floor((pos.z + 18) / 4) - 4);

  return _plotCoord;
}

function highlightPlot(plot) {
  if (plot.x > -5 && plot.x < 5 && plot.y > -3 && plot.y < 3) {
    if (plotOverlay.parent == null)
      scene.add(plotOverlay);
    plotOverlay.position.set(plot.x * 4, .01, plot.y * -4);
  }
  else {
    if (plotOverlay.parent != null)
      scene.remove(plotOverlay);
  }
}

_raycaster = new THREE.Raycaster();
_pointer = new THREE.Vector2();
function settlementMouseMove(x, y) {
  _pointer.x = (x / window.innerWidth) * 2 - 1;
  _pointer.y = - (y / window.innerHeight) * 2 + 1;
  _raycaster.setFromCamera(_pointer, camera);
  const intersects = _raycaster.intersectObjects(buildingsGroup.children);
  for (i = 0; i < buildingsGroup.children.length; i++)
    buildingsGroup.children[i].material.color.set(buildingColor);
  e("msg").innerText = "";
  e("msg").style.backgroundColor = "";
  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0x999999);
    e("msg").innerText = intersects[0].object.material.name;
    e("msg").style.backgroundColor = "rgba(255,255,255,.4)";
  }
  else {
    let plot = getPlotForMouse(x, y);
    if (plot.x != 0) {
      e("msg").innerText = "Leave Settlement";
      e("msg").style.backgroundColor = "rgba(255,255,255,.4)";
    }
  }
}

function plotOverlayIsWhite()
{
  return plotOverlay.material.color.r == 1 && 
          plotOverlay.material.color.g == 1 &&
          plotOverlay.material.color.b == 1;
}


function validForLandGrant(x, y)
{
  if (!awaiting.includes(myID))
    return false;
  return plotAvail(x, y);
}

_lastX = 0;
_lastY = 0;
function mouseMove(mouseEvent) {
  let x = 0;
  let y = 0;

  if (mouseEvent == null) {
    x = _lastX;
    y = _lastY;
  }
  else {
    x = mouseEvent.pageX;// - view.getBoundingClientRect().x, 
    y = mouseEvent.pageY;
    _lastX = x;
    _lastY = y;
  }

  x *= window.devicePixelRatio;
  y *= window.devicePixelRatio;

  if (state == st.LANDGRANT || state == st.MOVEPLAYER) {
    if (plotOverlayIsWhite()) {
      let plot = getPlotForMouse(x, y);
      if (state == st.LANDGRANT && !validForLandGrant(plot.x, plot.y))
        plot.x = 9;  // cause highlotPlot to make overlay go away...
      highlightPlot(plot);
    }
  }
  else if (state == st.SETTLEMENT) {
    settlementMouseMove(x, y);
  }
}

function startMove(char, spd)
{
  
}

function checkForCharMoveSet()
{
  for (i = 0; i < buildingsGroup.children.length; i++)
    if (buildingsGroup.children[i].material.color.r > .5)
    {
      pl[myChar].dest = [buildingsGroup.children[i].position.x, pl[myChar].model.position.z];
      pl[myChar].speed = 1.5;
      pl[myChar].model.rotation.y = Math.atan2(pl[myChar].dest[0] - pl[myChar].model.position.x,
                                               pl[myChar].dest[1] - pl[myChar].model.position.z);
      break;
    }
}

function checkForCharMovePlots(x, y)
{
  pl[myChar].dest = [plotOverlay.position.x, plotOverlay.position.z];
  pl[myChar].speed = 2.5;
  pl[myChar].model.rotation.y = Math.atan2(pl[myChar].dest[0] - pl[myChar].model.position.x,
                                           pl[myChar].dest[1] - pl[myChar].model.position.z);
}

function mouseClick(mouseEvent) {

  let x = mouseEvent.pageX;// - view.getBoundingClientRect().x, 
  let y = mouseEvent.pageY;

  x *= window.devicePixelRatio;
  y *= window.devicePixelRatio;

  if (state == st.MOVEPLAYER) {
    let plot = getPlotForMouse(x, y);
    /*if (plot.x == 0 && plot.y == 0) {
      state = st.TRANSITION_TO_SETTLEMENT;
      scene.remove(plotOverlay);
    }
    else {*/
      checkForCharMovePlots(plot.x, plot.y);
    //}
  }
  if (state == st.SETTLEMENT) {
    let plot = getPlotForMouse(x, y);
    if (plot.x != 0) {
      state = st.TRANSITION_OUT_STLMNT;
      pl[myChar].dest = [plot.x * 3, plotOverlay.position.z];
      pl[myChar].model.rotation.y = Math.atan2(pl[myChar].dest[0] - pl[myChar].model.position.x,
        pl[myChar].dest[1] - pl[myChar].model.position.z);
      e("msg").innerText = "";
      e("msg").style.backgroundColor = "";
    }
    else {
      checkForCharMoveSet();
    }
  }
  if (state == st.LANDGRANT && plotOverlayIsWhite()) {
    let plot = getPlotForMouse(x, y);
    if (plotAvail(plot.x, plot.y)) {
      plotOverlay.material.color.set(colorStr[myChar]);
      socket.send(JSON.stringify({ msg: "PlotRequest", x: plot.x, y: -plot.y }));
    }
  }
}

function tooFar(from, to, pos) {
  if (from.x != to.x)
    return Math.abs(to.x - from.x) <= Math.abs(pos.x - from.x);
  if (from.y != to.y)
    return Math.abs(to.y - from.y) <= Math.abs(pos.y - from.y);
  if (from.z != to.z)
    return Math.abs(to.z - from.z) <= Math.abs(pos.z - from.z);
  return true;
}

_mov = new THREE.Vector3()
function move(from, to, dist, done=null) {
  _mov.set(to.x, to.y, to.z);
  _mov.sub(from);
  _mov.normalize();
  _mov.multiplyScalar(dist);
  _mov.add(from);
  if (tooFar(from, to, _mov))
  {
    _mov.set(to.x, to.y, to.z);
    if (done != null) done.done = true;
  }

  return _mov;
}

const cpset = new THREE.Vector3(0, 1.8, 4);
const crxset = -.4;
const cpfar = new THREE.Vector3(0, 32.7, 23);
const crxfar = -.935;

function handleCamMove(delta) {

  if (state == st.TRANSITION_TO_SETTLEMENT) {
    camera.position.copy(move(camera.position, cpset, 60 * delta));
    if (camera.position.equals(cpset)) {
      camera.rotation.x = crxset;
      state = st.SETTLEMENT;
    }
    else {
      let pct = (camera.position.z - cpfar.z) / (cpset.z - cpfar.z);
      if (pct > .75) {
        pct -= .75;
        pct *= 4;
        camera.rotation.x = crxfar + (pct * (crxset - crxfar));
      }
    }
  }
  else if (state == st.TRANSITION_OUT_STLMNT) {
    camera.position.copy(move(camera.position, cpfar, 60 * delta));
    if (camera.position.equals(cpfar)) {
      state = st.MOVEPLAYER;
      camera.rotation.x = crxfar;
    }
    else {
      let pct = (camera.position.z - cpset.z) / (cpfar.z - cpset.z);
      if (pct < .25) {
        pct *= 4;
        camera.rotation.x = crxset - (pct * (crxset - crxfar));
      }
      else
        camera.rotation.x = crxfar;
    }
  }
}


function strToPlot(plotStr)
{
  let e = Number(plotStr[2])
  if (plotStr[1] == 'W')
    e = -e;
  let s = Number(plotStr[4])
  if (plotStr[3] == 'N')
    s = -s;
  return [e,s];
}


function plotToStr(e, s)
{
  let k = 'P';
  if (e > 0)
    k += 'E'
  else if (e < 0)
    k += 'W'
  else
    k += 'R'
  k += Math.abs(e)
  if (s >= 0)
    k += 'S'
  else
    k += 'N'
  k += Math.abs(s);
  return k;
}


function plotAvail(e, s)
{
  let k = plotToStr(e,s);
  if (!(k in plots))
    return false;
  if (e == 0 && s == 0)
    return false;
  return plots[k].ownerChar == 0;
}
