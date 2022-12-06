
function render() {

	const delta = clock.getDelta();

    /*
	if (modelReady) 
	{
		//console.log(mixer.time);
		let newTime = mixer.time + (delta * 12);
		if (newTime > 20.5)
			newTime -= 16.5;
		//mixer.setTime(newTime);
		mixer.setTime(mulestilltime);
		if (mule)
		{
			//mule.position.x -= clock.getDelta() * 60;
		}
	}

	for (let i=0; i<4; i++)
	{
		if (dudeready[i])
		{
			//dudemixer.update(delta)
			dudemixer[i].setTime(dudestilltime);
		}
	}

	if (ctransstart)
	{
		movecam();
	}

//	*/

	renderer.render( scene, camera );

}


function animate() {

	requestAnimationFrame( animate );

	render();

}