
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

function debugTraverse(child)
{
	console.log("found " + child.type);
	if ( child.isMesh ) 
	{
		var material = child.material;
		console.log(material);
		console.log(material.map);
		material.map = redft;
		if ( Array.isArray( material ) ) 
		{
			if ( material[ 0 ].isMeshPhongMaterial ) 
			{
				console.log( "material map is ", material[ 0 ].map ); //can get map but its image is undefined
				console.log( "material map image is ", material[ 0 ].map.image ); //material map image is  undefined
			}
		} 
		else if ( material.isMeshPhongMaterial ) 
		{
			console.log( "material map is ", material.map ); //can get map but its image is undefined
			console.log( "material map image is ", material.map.image ); //material map image is  undefined
		}
	}
}



function animate() 
{
	requestAnimationFrame( animate );
	render();
}