
function render() 
{
	const delta = clock.getDelta();

	handleCamMove(delta);
	moveChars(delta);
	animFlags(delta);

	renderer.render( scene, camera );
}

function animFlags(delta)
{
	for (fl of flags)
		fl.mixer.update(delta);
}

function debug(object)
{
	object.traverse( debugTraverse );
}


function animate() 
{
	requestAnimationFrame( animate );
	render();
}

dudestilltime = .55;
mulestilltime = 7;

_v3 = new THREE.Vector3();
_v3r = new THREE.Vector3();
_done = {done:false};
function moveChars(delta)
{
	for (i=1; i<5; i++)
	{
    if (pl[i].model == null)
      continue;
    if (pl[i].dest != null)
    {
      _v3.set(pl[i].dest[0], pl[i].model.position.y, pl[i].dest[1]);
      _done.done = false;
      _v3r = move(pl[i].model.position, _v3, pl[i].speed * delta, _done);
      pl[i].model.position.set(_v3r.x, _v3r.y, _v3r.z);
      if (_done.done)
      {
        pl[i].mixer.setTime(dudestilltime);
        pl[i].dest = null;
        pl[i].model.rotation.y = 0;
      }
      else
      {
        let newTime = pl[i].mixer.time + (delta * pl[i].speed);
        if (newTime > 20.5)
          newTime -= 16.5;
        pl[i].mixer.setTime(newTime);
      }
    }
    if (i == myChar)
    {
      let pos = pl[i].model.position;
      if (pl[i].dest != null && pl[i].dest[0] == 0 && pl[i].dest[1] == 0 && 
          state == st.MOVEPLAYER && pos.x > -2 && pos.x < 2 && pos.y > -2 && pos.y < 2)
      {
        state = st.TRANSITION_TO_SETTLEMENT;
        scene.remove(plotOverlay);
      }
    }
	}
}