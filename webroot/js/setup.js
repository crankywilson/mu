let scene, camera, clock, renderer, water;
let plmod = [null, null, null, null];       // r, y, g, b
let dudemixer = [null, null, null, null];   // r, y, g, b
let totalModels = 0;
let totalCalculated = false;
let modelsLoaded = 0;
let mulemod = null;
let flagb = null;
let redft = null;
let foodmdl = null;
let energymdl = null;
let smithoremdl = null;
let crystitemdl = null;
let buildingsGroup = null;
const buildingColor = 0x666666;

function e(el)
{
  return document.getElementById(el);
}


function setup()
{
    setupWebsock();

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
    totalModels++;
	textureLoader.load( 'img/sand.jpg', sandLoaded, prog); 
    totalModels++;
    textureLoader.load( 'img/rb.jpg', riverbedloaded, prog);
    totalModels++;
    textureLoader.load( 'img/mountains.jpg', mountainsLoaded, prog);
    

	// buildings
    buildingsGroup = new THREE.Group()
	const bm = [];
    for (i=0; i<8; i++)
      bm[i] = new THREE.MeshLambertMaterial( {color: buildingColor, reflectivity: 15} );

    bm[0].name = 'Crystite';
    bm[1].name = 'Smithore';
    bm[2].name = 'Energy';
    bm[3].name = 'Food';
    bm[4].name = 'Assay';
    bm[5].name = 'Land';
    bm[6].name = 'Cantina';
    bm[7].name = 'Mule';

	for (i=0; i<4; i++)
	{
		let b1g = new THREE.BoxGeometry( .5, .4, .1 );
		let b1mesh = new THREE.Mesh( b1g, bm[i] );
		b1mesh.position.set(-1.1 + i*.7333, .2, -1.6);
		buildingsGroup.add( b1mesh );

		let b2g = new THREE.BoxGeometry( .5, .4, .1 );
		let b2mesh = new THREE.Mesh( b2g, bm[i+4] );
		b2mesh.position.set(-1.1 + i*.7333, .2, 1.6);
		buildingsGroup.add( b2mesh );

		let b1gl = new THREE.BoxGeometry( .1, .4, .5 );
		let b1lmesh = new THREE.Mesh( b1gl, bm[i] );
		b1lmesh.position.set(-.9 + i*.7333, .2, -1.3);
		buildingsGroup.add( b1lmesh );

		let b1gr = new THREE.BoxGeometry( .1, .4, .5 );
		let b1rmesh = new THREE.Mesh( b1gr, bm[i] );
		b1rmesh.position.set(-1.3 + i*.7333, .2, -1.3);
		buildingsGroup.add( b1rmesh );

		let b2gr = new THREE.BoxGeometry( .1, .4, .5 );
		let b2rmesh = new THREE.Mesh( b2gr, bm[i+4] );
		b2rmesh.position.set(-1.3 + i*.7333, .2, 1.3);
		buildingsGroup.add( b2rmesh );

		let b2gl = new THREE.BoxGeometry( .1, .4, .5 );
		let b2lmesh = new THREE.Mesh( b2gl, bm[i+4] );
		b2lmesh.position.set(-.9 + i*.7333, .2, 1.3);
		buildingsGroup.add( b2lmesh );
	}
    scene.add(buildingsGroup);

    /* skybox

	const cubeTextureLoader = new THREE.CubeTextureLoader();

	const cubeTexture = cubeTextureLoader.load( [
		'img/px.jpg', 'img/px.jpg',
		'img/py.jpg', 'img/py.jpg',
		'img/px.jpg', 'img/pz.jpg'
	] );

	scene.background = cubeTexture;
    */
    scene.background = new THREE.Color( 0xffeedd );

    const gltfl = new GLTFLoader();
    totalModels++;
	gltfl.load('models/atat/scene.gltf', muleloaded, prog, n);
    totalModels++;
	gltfl.load('models/plants/plants.gltf', foodloaded, prog, n);
    totalModels++;
	gltfl.load('models/energy/energy.gltf', energyloaded, prog, n);
    totalModels++;
	gltfl.load('models/excv/excv.gltf', smithoreloaded, prog, n);
    totalModels++;
    gltfl.load('models/drill/drill.gltf', crystiteloaded, prog, n);
    totalModels++;
	gltfl.load('models/blueflag/scene.gltf', flagloaded, n, n);

    const tl = new THREE.TextureLoader();
    totalModels++;
    tl.load('img/redf.png', function(t) { redft = t; loadProgress(); });

	window.addEventListener( 'resize', onWindowResize );
	onWindowResize();
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

function loadProgress()
{
    modelsLoaded++;
    e("msg").innerText = "Model " + modelsLoaded + "  of " + totalModels + " loaded";
    
    if (totalCalculated && modelsLoaded == totalModels)
        setupComplete();
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
    dudemixer[n].setTime(.55);
    scene.add(dude);

    loadProgress();
}


function muleloaded(mule)
{
    mulemod = mule.scene;
    mulemod.scale.set(.06,.05,.06);
    mulemod.rotation.y = Math.PI;
    mulemod.position.set(1.1,0,1.1);
    let mixer = new THREE.AnimationMixer(mule.scene);
    let action = mixer.clipAction( mule.animations[ 0 ] );
    action.play();
    mixer.setTime(7);

    loadProgress();
}

function foodloaded(mdl)
{
    foodmdl = mdl.scene;
    foodmdl.scale.set(100,50,100);
    foodmdl.rotation.y = Math.PI;
    foodmdl.position.set(0,-.15,-4);
    //scene.add(foodmdl);

    loadProgress();
}

function energyloaded(mdl)
{
    energymdl = mdl.scene;
    energymdl.scale.set(.5,.5,.5);
    energymdl.rotation.y = 1.8;
    energymdl.position.set(4,0,-4);
    //scene.add(energymdl);

    loadProgress();
}

function smithoreloaded(mdl)
{
    smithoremdl = mdl.scene;
    smithoremdl.scale.set(10,10,10);
    smithoremdl.rotation.y = -1;
    smithoremdl.position.set(-4,-0,0);
    //scene.add(smithoremdl);

    loadProgress();
}

function crystiteloaded(mdl)
{
    crystitemdl = mdl.scene;
    crystitemdl.scale.set(30,30,30);
    crystitemdl.position.set(-4,-0,-4);
    //scene.add(crystitemdl);

    loadProgress();
}

function flagloaded(fl)
{
    flagb = fl.scene;
    flagb.scale.set(.2,.2,.2);
    flagb.position.set(1.1,.4,-.8);
    let mixer = new THREE.AnimationMixer(fl.scene);
    let action = mixer.clipAction( fl.animations[ 0 ] );
    action.play();
    //scene.add(flagb);
    //flags.push({scene:fl.scene, mixer:mixer});
    loadProgress();
}

gmo = null;
function mountainsLoaded(mt)
{
    const mp = new THREE.PlaneGeometry( 50, 8 );
    const mm = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
    mt.wrapS = THREE.RepeatWrapping;
    mt.wrapT = THREE.RepeatWrapping;
    mt.anisotropy = 16;
    mt.repeat.set( 1, 1 );
    mm.map = mt;
    gmo = new THREE.Mesh( mp, mm );
    gmo.position.set(0,4,-11);
    scene.add(gmo);
    loadProgress();
}

function riverbedloaded(rbtext)
{
    const groundGeometry4 = new THREE.PlaneGeometry( 60, 30 );
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
		scale: 1.8,
		flowDirection: new THREE.Vector2( 0, .25 ),
		textureWidth: 1024,
		textureHeight: 1024
	} );

	water.position.y = -.1;
	water.rotation.x = Math.PI * - 0.5;
	scene.add( water );

    loadProgress();
}


function sandLoaded(sandtexture)
{
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

    loadProgress();
}

function prog(p)
{
    let m = e('msg').innerText;
    if (m.indexOf('[') > 0) 
        m = m.substring(0, m.indexOf('[') - 1);
    m += ' [' + p.loaded + ']';
    e('msg').innerText = m;
}