let scene, camera, clock, renderer, water;
let plmod = [null, null, null, null];
let dudemixer = [null, null, null, null];

function e(el)
{
  return document.getElementById(el);
}

function setup()
{
    scene = new THREE.Scene();

    // camera

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 200 );
    camera.position.set( 0, 32.7, 23 );
    camera.rotation.set(-.935, 0, 0);

    // clock

    clock = new THREE.Clock();

    // light

	const ambientLight = new THREE.AmbientLight( 0xcccccc, 1.8 );
	scene.add( ambientLight );

	const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
	directionalLight.position.set( - 1, 1, -1 );
	scene.add( directionalLight );

	// renderer

	boardview = document.getElementById("boardview");
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( boardview.clientWidth, boardview.clientHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.getElementById("boardview").appendChild( renderer.domElement );

    // ground
    const textureLoader = new THREE.TextureLoader();
	textureLoader.load( 'img/sand.jpg', sandLoaded); 

    textureLoader.load( 'img/rb.jpg', riverbedloaded);

    
	// buildings
	const bm = new THREE.MeshLambertMaterial( {color: 0x666666, reflectivity: 15} );

	for (i=0; i<4; i++)
	{
		let b1g = new THREE.BoxGeometry( .5, .4, .1 );
		let b1mesh = new THREE.Mesh( b1g, bm );
		b1mesh.position.set(-1.1 + i*.7333, .2, -1.6);
		scene.add( b1mesh );

		let b2g = new THREE.BoxGeometry( .5, .4, .1 );
		let b2mesh = new THREE.Mesh( b2g, bm );
		b2mesh.position.set(-1.1 + i*.7333, .2, 1.6);
		scene.add( b2mesh );

		let b1gl = new THREE.BoxGeometry( .1, .4, .5 );
		let b1lmesh = new THREE.Mesh( b1gl, bm );
		b1lmesh.position.set(-.9 + i*.7333, .2, -1.3);
		scene.add( b1lmesh );

		let b1gr = new THREE.BoxGeometry( .1, .4, .5 );
		let b1rmesh = new THREE.Mesh( b1gr, bm );
		b1rmesh.position.set(-1.3 + i*.7333, .2, -1.3);
		scene.add( b1rmesh );

		let b2gr = new THREE.BoxGeometry( .1, .4, .5 );
		let b2rmesh = new THREE.Mesh( b2gr, bm );
		b2rmesh.position.set(-1.3 + i*.7333, .2, 1.3);
		scene.add( b2rmesh );

		let b2gl = new THREE.BoxGeometry( .1, .4, .5 );
		let b2lmesh = new THREE.Mesh( b2gl, bm );
		b2lmesh.position.set(-.9 + i*.7333, .2, 1.3);
		scene.add( b2lmesh );
	}

    // skybox

	const cubeTextureLoader = new THREE.CubeTextureLoader();

	const cubeTexture = cubeTextureLoader.load( [
		'img/px.jpg', 'img/px.jpg',
		'img/py.jpg', 'img/py.jpg',
		'img/px.jpg', 'img/pz.jpg'
	] );

	scene.background = cubeTexture;

    const fbxLoader = new FBXLoader()
	fbxLoader.load('models/red.fbx', fbxloaded_r, n, n);
    fbxLoader.load('models/yellow.fbx', fbxloaded_y, n, n);
    fbxLoader.load('models/green.fbx', fbxloaded_g, n, n);
    fbxLoader.load('models/blue.fbx', fbxloaded_b, n, n);

	window.addEventListener( 'resize', onWindowResize );
	onWindowResize();

    requestAnimationFrame( animate );
}

function n(ignore)
{
}

function onWindowResize() {
	boardview = document.getElementById("boardview");
	camera.aspect = 2;//window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( boardview.clientWidth, boardview.clientHeight );

}

function fbxloaded(dude, n, x, z)
{
    dude.scale.set(.004,.0025,.004);
    dude.position.x = x;
    dude.position.z = z;

    plmod[n] = dude;
    dudemixer[n] = new THREE.AnimationMixer(dude);
    let action = dudemixer[n].clipAction( dude.animations[0] );
    action.play();

    scene.add(dude);
}

function fbxloaded_r(fbx)
{
    e("msg").innerText = "Model 1 of n loaded";
    fbxloaded(fbx, 0, .5, -.3);
}

function fbxloaded_y(fbx)
{
    e("msg").innerText = "Model 2 of n loaded";
    fbxloaded(fbx, 0, .25, -.1);
}

function fbxloaded_g(fbx)
{
    e("msg").innerText = "Model 3 of n loaded";
    fbxloaded(fbx, 0, 0, .1);
}

function fbxloaded_b(fbx)
{
    e("msg").innerText = "Model 4 of n loaded";
    fbxloaded(fbx, 0, -.25, .3);
}



function riverbedloaded(rbtext)
{
    e("msg").innerText = "Texture 2 of n loaded";

    const groundGeometry4 = new THREE.PlaneGeometry( 60, 25 );
    const groundMaterial4 = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );

    rbtext.wrapS = THREE.RepeatWrapping;
    rbtext.wrapT = THREE.RepeatWrapping;
    rbtext.anisotropy = 16;
    rbtext.repeat.set( 5, 1 );
    groundMaterial4.map = rbtext;
    groundMaterial4.needsUpdate = true;

    const ground4 = new THREE.Mesh( groundGeometry4, groundMaterial4 );
    ground4.position.x = 0
    ground4.position.y = -1;
    ground4.rotation.x = Math.PI * - 0.5;
    scene.add( ground4 );

    // water
	const waterGeometry = new THREE.PlaneGeometry( 10, 23 );

	water = new Water( waterGeometry, {
		color: '#ffffff',
		scale: 4,
		flowDirection: new THREE.Vector2( 0, .6 ),
		textureWidth: 1024,
		textureHeight: 1024
	} );

	water.position.y = -.1;
	water.rotation.x = Math.PI * - 0.5;
	scene.add( water );
}


function sandLoaded(sandtexture)
{
    e("msg").innerText = "Texture 1 of n loaded";

    const groundMaterial = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
    sandtexture.wrapS = THREE.RepeatWrapping;
    sandtexture.wrapT = THREE.RepeatWrapping;
    sandtexture.anisotropy = 16;
    sandtexture.repeat.set( 6, 6 );
    groundMaterial.map = sandtexture;
    groundMaterial.needsUpdate = true;

    const groundGeometry = new THREE.PlaneGeometry( 60, 23 );
    
    const ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.position.x = -32
    ground.position.y = 0;
    ground.rotation.x = Math.PI * - 0.5;
    scene.add( ground );

    const ground2 = new THREE.Mesh( groundGeometry, groundMaterial );
    ground2.position.x = 32
    ground2.position.y = 0;
    ground2.rotation.x = Math.PI * - 0.5;
    scene.add( ground2 );

    const groundGeometry3 = new THREE.PlaneGeometry( 3.1, 3.6 );
    const groundMaterial3 = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
    const ground3 = new THREE.Mesh( groundGeometry3, groundMaterial3 );
    groundMaterial3.map = sandtexture;
    ground3.position.x = 0
    ground3.position.y = 0;
    ground3.rotation.x = Math.PI * - 0.5;
    scene.add( ground3 );
}

