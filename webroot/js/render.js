
function render() {

	const delta = clock.getDelta();

	handleCamMove(delta);

	renderer.render( scene, camera );

}


function animate() {

	requestAnimationFrame( animate );

	render();

}