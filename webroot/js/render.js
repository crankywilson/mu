
function render() 
{
	const delta = clock.getDelta();

	handleCamMove(delta);
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