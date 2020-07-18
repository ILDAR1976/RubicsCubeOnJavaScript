sbVertexShader = [
"varying vec3 vWorldPosition;",
"void main() {",
"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
"  vWorldPosition = worldPosition.xyz;",
"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
"}",
].join("\n");

sbFragmentShader = [
"uniform vec3 topColor;",
"uniform vec3 bottomColor;",
"uniform float offset;",
"uniform float exponent;",
"varying vec3 vWorldPosition;",
"void main() {",
"  float h = normalize( vWorldPosition + offset ).y;",
"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
"}",
].join("\n");

var mouse = new THREE.Vector2();
var axis;
var rad;

var oldInd = {
	ind: 0,
	faceInd: 0,
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var bufInd = {
	ind: 0,
	faceInd: 0,
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var curInd = {
	ind: 0,
	faceInd: 0,
	g: 0,
	x: 0,
	y: 0,
	z: 0
}

var oldRot = {
	x: 1,
	y: 1,
	z: 1
}

var rotateDelta = {
	x: 0,
	y: 0,
	z: 0
}

var rotate = false;

var lesson10 = {
  scene: null, camera: null, renderer: null, 
  container: null, controls: null, group: null, group1: null, group2: null,
  clock: null, stats: null, dragControls: null, begin: 0, end: 0, delta: 0, track: 0,
  plane: null, selection: null, offset: new THREE.Vector3(), objects: [], grp: [],
  raycaster: new THREE.Raycaster(),

  init: function() {

    // Create main scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(100, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.fog.color);

    // Prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // Events
    THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 8;

	//this.dragControls = new DragControls( [ ... objects ], camera, renderer.domElement );
	//this.dragControls.addEventListener( 'drag', render );
    // Prepare clock
    this.clock = new THREE.Clock();

    // Prepare stats
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '50px';
    this.stats.domElement.style.bottom = '50px';
    this.stats.domElement.style.zIndex = 1;
    this.container.appendChild( this.stats.domElement );

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x444444));

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    // Display skybox
    this.addSkybox();

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
    this.plane.visible = false;
    this.scene.add(this.plane);

    // Add 100 random objects (spheres)
    var object, material, radius;
	
	this.group = new THREE.Group();
   	
	this.scene.add(this.group);
	
{
var g1 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g1.faces[0].color = new THREE.Color(0, 0, 0);
g1.faces[1].color = new THREE.Color(0, 0, 0);
g1.faces[2].color = new THREE.Color(0x2196f3);
g1.faces[3].color = new THREE.Color(0x2196f3);
g1.faces[4].color = new THREE.Color(0, 0, 0);
g1.faces[5].color = new THREE.Color(0, 0, 0);
g1.faces[6].color = new THREE.Color(1, 0, 0);
g1.faces[7].color = new THREE.Color(1, 0, 0);
g1.faces[8].color = new THREE.Color(0, 0, 0);
g1.faces[9].color = new THREE.Color(0, 0, 0);
g1.faces[10].color = new THREE.Color(0, 0, 1);
g1.faces[11].color = new THREE.Color(0, 0, 1);
var m1 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g2 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g2.faces[0].color = new THREE.Color(0, 0, 0);
g2.faces[1].color = new THREE.Color(0, 0, 0);
g2.faces[2].color = new THREE.Color(0, 0, 0);
g2.faces[3].color = new THREE.Color(0, 0, 0);
g2.faces[4].color = new THREE.Color(0, 0, 0);
g2.faces[5].color = new THREE.Color(0, 0, 0);
g2.faces[6].color = new THREE.Color(1, 0, 0);
g2.faces[7].color = new THREE.Color(1, 0, 0);
g2.faces[8].color = new THREE.Color(0, 0, 0);
g2.faces[9].color = new THREE.Color(0, 0, 0);
g2.faces[10].color = new THREE.Color(0, 0, 1);
g2.faces[11].color = new THREE.Color(0, 0, 1);
var m2 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g3 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g3.faces[0].color = new THREE.Color(0xFF8000);
g3.faces[1].color = new THREE.Color(0xFF8000);
g3.faces[2].color = new THREE.Color(0,0,0);
g3.faces[3].color = new THREE.Color(0,0,0);
g3.faces[4].color = new THREE.Color(0,0,0);
g3.faces[5].color = new THREE.Color(0,0,0);
g3.faces[6].color = new THREE.Color(1,0,0);
g3.faces[7].color = new THREE.Color(1,0,0);
g3.faces[8].color = new THREE.Color(0,0,0);
g3.faces[9].color = new THREE.Color(0,0,0);
g3.faces[10].color = new THREE.Color(0,0,1);
g3.faces[11].color = new THREE.Color(0,0,1);
var m3 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g4 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g4.faces[0].color = new THREE.Color(0,0,0);
g4.faces[1].color = new THREE.Color(0,0,0);
g4.faces[2].color = new THREE.Color(0x2196f3);
g4.faces[3].color = new THREE.Color(0x2196f3);
g4.faces[4].color = new THREE.Color(0,0,0);
g4.faces[5].color = new THREE.Color(0,0,0);
g4.faces[6].color = new THREE.Color(0,0,0);
g4.faces[7].color = new THREE.Color(0,0,0);
g4.faces[8].color = new THREE.Color(0,0,0);
g4.faces[9].color = new THREE.Color(0,0,0);
g4.faces[10].color = new THREE.Color(0,0,1);
g4.faces[11].color = new THREE.Color(0,0,1);
var m4 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g5 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g5.faces[0].color = new THREE.Color(0,0,0);
g5.faces[1].color = new THREE.Color(0,0,0);
g5.faces[2].color = new THREE.Color(0,0,0);
g5.faces[3].color = new THREE.Color(0,0,0);
g5.faces[4].color = new THREE.Color(0,0,0);
g5.faces[5].color = new THREE.Color(0,0,0);
g5.faces[6].color = new THREE.Color(0,0,0);
g5.faces[7].color = new THREE.Color(0,0,0);
g5.faces[8].color = new THREE.Color(0,0,0);
g5.faces[9].color = new THREE.Color(0,0,0);
g5.faces[10].color = new THREE.Color(0,0,1);
g5.faces[11].color = new THREE.Color(0,0,1);
var m5 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g6 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g6.faces[0].color = new THREE.Color(0xFF8000);
g6.faces[1].color = new THREE.Color(0xFF8000);
g6.faces[2].color = new THREE.Color(0,0,0);
g6.faces[3].color = new THREE.Color(0,0,0);
g6.faces[4].color = new THREE.Color(0,0,0);
g6.faces[5].color = new THREE.Color(0,0,0);
g6.faces[6].color = new THREE.Color(0,0,0);
g6.faces[7].color = new THREE.Color(0,0,0);
g6.faces[8].color = new THREE.Color(0,0,0);
g6.faces[9].color = new THREE.Color(0,0,0);
g6.faces[10].color = new THREE.Color(0,0,1);
g6.faces[11].color = new THREE.Color(0,0,1);
var m6 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g7 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g7.faces[0].color = new THREE.Color(0,0,0);
g7.faces[1].color = new THREE.Color(0,0,0);
g7.faces[2].color = new THREE.Color(0x2196f3);
g7.faces[3].color = new THREE.Color(0x2196f3);
g7.faces[4].color = new THREE.Color(0xffffff);
g7.faces[5].color = new THREE.Color(0xffffff);
g7.faces[6].color = new THREE.Color(0,0,0);
g7.faces[7].color = new THREE.Color(0,0,0);
g7.faces[8].color = new THREE.Color(0,0,0);
g7.faces[9].color = new THREE.Color(0,0,0);
g7.faces[10].color = new THREE.Color(0,0,1);
g7.faces[11].color = new THREE.Color(0,0,1);
var m7 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g8 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g8.faces[0].color = new THREE.Color(0,0,0);
g8.faces[1].color = new THREE.Color(0,0,0);
g8.faces[2].color = new THREE.Color(0,0,0);
g8.faces[3].color = new THREE.Color(0,0,0);
g8.faces[4].color = new THREE.Color(0xffffff);
g8.faces[5].color = new THREE.Color(0xffffff);
g8.faces[6].color = new THREE.Color(0,0,0);
g8.faces[7].color = new THREE.Color(0,0,0);
g8.faces[8].color = new THREE.Color(0,0,0);
g8.faces[9].color = new THREE.Color(0,0,0);
g8.faces[10].color = new THREE.Color(0,0,1);
g8.faces[11].color = new THREE.Color(0,0,1);
var m8 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g9 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g9.faces[0].color = new THREE.Color(0xFF8000);
g9.faces[1].color = new THREE.Color(0xFF8000);
g9.faces[2].color = new THREE.Color(0,0,0);
g9.faces[3].color = new THREE.Color(0,0,0);
g9.faces[4].color = new THREE.Color(0xffffff);
g9.faces[5].color = new THREE.Color(0xffffff);
g9.faces[6].color = new THREE.Color(0,0,0);
g9.faces[7].color = new THREE.Color(0,0,0);
g9.faces[8].color = new THREE.Color(0,0,0);
g9.faces[9].color = new THREE.Color(0,0,0);
g9.faces[10].color = new THREE.Color(0,0,1);
g9.faces[11].color = new THREE.Color(0,0,1);
var m9 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

//second layer

var g10 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g10.faces[0].color = new THREE.Color(0,0,0);
g10.faces[1].color = new THREE.Color(0,0,0);
g10.faces[2].color = new THREE.Color(0x2196f3);
g10.faces[3].color = new THREE.Color(0x2196f3);
g10.faces[4].color = new THREE.Color(0,0,0);
g10.faces[5].color = new THREE.Color(0,0,0);
g10.faces[6].color = new THREE.Color(1,0,0);
g10.faces[7].color = new THREE.Color(1,0,0);
g10.faces[8].color = new THREE.Color(0,0,0);
g10.faces[9].color = new THREE.Color(0,0,0);
g10.faces[10].color = new THREE.Color(0,0,0);
g10.faces[11].color = new THREE.Color(0,0,0);
var m10 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g11 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g11.faces[0].color = new THREE.Color(0,0,0);
g11.faces[1].color = new THREE.Color(0,0,0);
g11.faces[2].color = new THREE.Color(0,0,0);
g11.faces[3].color = new THREE.Color(0,0,0);
g11.faces[4].color = new THREE.Color(0,0,0);
g11.faces[5].color = new THREE.Color(0,0,0);
g11.faces[6].color = new THREE.Color(1,0,0);
g11.faces[7].color = new THREE.Color(1,0,0);
g11.faces[8].color = new THREE.Color(0,0,0);
g11.faces[9].color = new THREE.Color(0,0,0);
g11.faces[10].color = new THREE.Color(0,0,0);
g11.faces[11].color = new THREE.Color(0,0,0);
var m11 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g12 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g12.faces[0].color = new THREE.Color(0xFF8000);
g12.faces[1].color = new THREE.Color(0xFF8000);
g12.faces[2].color = new THREE.Color(0,0,0);
g12.faces[3].color = new THREE.Color(0,0,0);
g12.faces[4].color = new THREE.Color(0,0,0);
g12.faces[5].color = new THREE.Color(0,0,0);
g12.faces[6].color = new THREE.Color(1,0,0);
g12.faces[7].color = new THREE.Color(1,0,0);
g12.faces[8].color = new THREE.Color(0,0,0);
g12.faces[9].color = new THREE.Color(0,0,0);
g12.faces[10].color = new THREE.Color(0,0,0);
g12.faces[11].color = new THREE.Color(0,0,0);
var m12 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g13 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g13.faces[0].color = new THREE.Color(0,0,0);
g13.faces[1].color = new THREE.Color(0,0,0);
g13.faces[2].color = new THREE.Color(0x2196f3);
g13.faces[3].color = new THREE.Color(0x2196f3);
g13.faces[4].color = new THREE.Color(0,0,0);
g13.faces[5].color = new THREE.Color(0,0,0);
g13.faces[6].color = new THREE.Color(0,0,0);
g13.faces[7].color = new THREE.Color(0,0,0);
g13.faces[8].color = new THREE.Color(0,0,0);
g13.faces[9].color = new THREE.Color(0,0,0);
g13.faces[10].color = new THREE.Color(0,0,0);
g13.faces[11].color = new THREE.Color(0,0,0);
var m13 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g14 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g14.faces[0].color = new THREE.Color(0,0,0);
g14.faces[1].color = new THREE.Color(0,0,0);
g14.faces[2].color = new THREE.Color(0,0,0);
g14.faces[3].color = new THREE.Color(0,0,0);
g14.faces[4].color = new THREE.Color(0,0,0);
g14.faces[5].color = new THREE.Color(0,0,0);
g14.faces[6].color = new THREE.Color(0,0,0);
g14.faces[7].color = new THREE.Color(0,0,0);
g14.faces[8].color = new THREE.Color(0,0,0);
g14.faces[9].color = new THREE.Color(0,0,0);
g14.faces[10].color = new THREE.Color(0,0,0);
g14.faces[11].color = new THREE.Color(0,0,0);
var m14 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g15 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g15.faces[0].color = new THREE.Color(0xFF8000);
g15.faces[1].color = new THREE.Color(0xFF8000);
g15.faces[2].color = new THREE.Color(0,0,0);
g15.faces[3].color = new THREE.Color(0,0,0);
g15.faces[4].color = new THREE.Color(0,0,0);
g15.faces[5].color = new THREE.Color(0,0,0);
g15.faces[6].color = new THREE.Color(0,0,0);
g15.faces[7].color = new THREE.Color(0,0,0);
g15.faces[8].color = new THREE.Color(0,0,0);
g15.faces[9].color = new THREE.Color(0,0,0);
g15.faces[10].color = new THREE.Color(0,0,0);
g15.faces[11].color = new THREE.Color(0,0,0);
var m15 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g16 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g16.faces[0].color = new THREE.Color(0,0,0);
g16.faces[1].color = new THREE.Color(0,0,0);
g16.faces[2].color = new THREE.Color(0x2196f3);
g16.faces[3].color = new THREE.Color(0x2196f3);
g16.faces[4].color = new THREE.Color(0xffffff);
g16.faces[5].color = new THREE.Color(0xffffff);
g16.faces[6].color = new THREE.Color(0,0,0);
g16.faces[7].color = new THREE.Color(0,0,0);
g16.faces[8].color = new THREE.Color(0,0,0);
g16.faces[9].color = new THREE.Color(0,0,0);
g16.faces[10].color = new THREE.Color(0,0,0);
g16.faces[11].color = new THREE.Color(0,0,0);
var m16 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g17 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g17.faces[0].color = new THREE.Color(0,0,0);
g17.faces[1].color = new THREE.Color(0,0,0);
g17.faces[2].color = new THREE.Color(0,0,0);
g17.faces[3].color = new THREE.Color(0,0,0);
g17.faces[4].color = new THREE.Color(0xffffff);
g17.faces[5].color = new THREE.Color(0xffffff);
g17.faces[6].color = new THREE.Color(0,0,0);
g17.faces[7].color = new THREE.Color(0,0,0);
g17.faces[8].color = new THREE.Color(0,0,0);
g17.faces[9].color = new THREE.Color(0,0,0);
g17.faces[10].color = new THREE.Color(0,0,0);
g17.faces[11].color = new THREE.Color(0,0,0);
var m17 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g18 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g18.faces[0].color = new THREE.Color(0xFF8000);
g18.faces[1].color = new THREE.Color(0xFF8000);
g18.faces[2].color = new THREE.Color(0,0,0);
g18.faces[3].color = new THREE.Color(0,0,0);
g18.faces[4].color = new THREE.Color(0xffffff);
g18.faces[5].color = new THREE.Color(0xffffff);
g18.faces[6].color = new THREE.Color(0,0,0);
g18.faces[7].color = new THREE.Color(0,0,0);
g18.faces[8].color = new THREE.Color(0,0,0);
g18.faces[9].color = new THREE.Color(0,0,0);
g18.faces[10].color = new THREE.Color(0,0,0);
g18.faces[11].color = new THREE.Color(0,0,0);
var m18 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

//third layer

var g19 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g19.faces[0].color = new THREE.Color(0,0,0);
g19.faces[1].color = new THREE.Color(0,0,0);
g19.faces[2].color = new THREE.Color(0x2196f3);
g19.faces[3].color = new THREE.Color(0x2196f3);
g19.faces[4].color = new THREE.Color(0,0,0);
g19.faces[5].color = new THREE.Color(0,0,0);
g19.faces[6].color = new THREE.Color(1,0,0);
g19.faces[7].color = new THREE.Color(1,0,0);
g19.faces[8].color = new THREE.Color(0,1,0);
g19.faces[9].color = new THREE.Color(0,1,0);
g19.faces[10].color = new THREE.Color(0,0,0);
g19.faces[11].color = new THREE.Color(0,0,0);
var m19 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g20 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g20.faces[0].color = new THREE.Color(0,0,0);
g20.faces[1].color = new THREE.Color(0,0,0);
g20.faces[2].color = new THREE.Color(0,0,0);
g20.faces[3].color = new THREE.Color(0,0,0);
g20.faces[4].color = new THREE.Color(0,0,0);
g20.faces[5].color = new THREE.Color(0,0,0);
g20.faces[6].color = new THREE.Color(1,0,0);
g20.faces[7].color = new THREE.Color(1,0,0);
g20.faces[8].color = new THREE.Color(0,1,0);
g20.faces[9].color = new THREE.Color(0,1,0);
g20.faces[10].color = new THREE.Color(0,0,0);
g20.faces[11].color = new THREE.Color(0,0,0);
var m20 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g21 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g21.faces[0].color = new THREE.Color(0xFF8000);
g21.faces[1].color = new THREE.Color(0xFF8000);
g21.faces[2].color = new THREE.Color(0,0,0);
g21.faces[3].color = new THREE.Color(0,0,0);
g21.faces[4].color = new THREE.Color(0,0,0);
g21.faces[5].color = new THREE.Color(0,0,0);
g21.faces[6].color = new THREE.Color(1,0,0);
g21.faces[7].color = new THREE.Color(1,0,0);
g21.faces[8].color = new THREE.Color(0,1,0);
g21.faces[9].color = new THREE.Color(0,1,0);
g21.faces[10].color = new THREE.Color(0,0,0);
g21.faces[11].color = new THREE.Color(0,0,0);
var m21 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g22 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g22.faces[0].color = new THREE.Color(0,0,0);
g22.faces[1].color = new THREE.Color(0,0,0);
g22.faces[2].color = new THREE.Color(0x2196f3);
g22.faces[3].color = new THREE.Color(0x2196f3);
g22.faces[4].color = new THREE.Color(0,0,0);
g22.faces[5].color = new THREE.Color(0,0,0);
g22.faces[6].color = new THREE.Color(0,0,0);
g22.faces[7].color = new THREE.Color(0,0,0);
g22.faces[8].color = new THREE.Color(0,1,0);
g22.faces[9].color = new THREE.Color(0,1,0);
g22.faces[10].color = new THREE.Color(0,0,0);
g22.faces[11].color = new THREE.Color(0,0,0);
var m22 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g23 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g23.faces[0].color = new THREE.Color(0,0,0);
g23.faces[1].color = new THREE.Color(0,0,0);
g23.faces[2].color = new THREE.Color(0,0,0);
g23.faces[3].color = new THREE.Color(0,0,0);
g23.faces[4].color = new THREE.Color(0,0,0);
g23.faces[5].color = new THREE.Color(0,0,0);
g23.faces[6].color = new THREE.Color(0,0,0);
g23.faces[7].color = new THREE.Color(0,0,0);
g23.faces[8].color = new THREE.Color(0,1,0);
g23.faces[9].color = new THREE.Color(0,1,0);
g23.faces[10].color = new THREE.Color(0,0,0);
g23.faces[11].color = new THREE.Color(0,0,0);
var m23 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g24 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g24.faces[0].color = new THREE.Color(0xFF8000);
g24.faces[1].color = new THREE.Color(0xFF8000);
g24.faces[2].color = new THREE.Color(0,0,0);
g24.faces[3].color = new THREE.Color(0,0,0);
g24.faces[4].color = new THREE.Color(0,0,0);
g24.faces[5].color = new THREE.Color(0,0,0);
g24.faces[6].color = new THREE.Color(0,0,0);
g24.faces[7].color = new THREE.Color(0,0,0);
g24.faces[8].color = new THREE.Color(0,1,0);
g24.faces[9].color = new THREE.Color(0,1,0);
g24.faces[10].color = new THREE.Color(0,0,0);
g24.faces[11].color = new THREE.Color(0,0,0);
var m24 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g25 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g25.faces[0].color = new THREE.Color(0,0,0);
g25.faces[1].color = new THREE.Color(0,0,0);
g25.faces[2].color = new THREE.Color(0x2196f3);
g25.faces[3].color = new THREE.Color(0x2196f3);
g25.faces[4].color = new THREE.Color(0xffffff);
g25.faces[5].color = new THREE.Color(0xffffff);
g25.faces[6].color = new THREE.Color(0,0,0);
g25.faces[7].color = new THREE.Color(0,0,0);
g25.faces[8].color = new THREE.Color(0,1,0);
g25.faces[9].color = new THREE.Color(0,1,0);
g25.faces[10].color = new THREE.Color(0,0,0);
g25.faces[11].color = new THREE.Color(0,0,0);
var m25 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g26 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g26.faces[0].color = new THREE.Color(0,0,0);
g26.faces[1].color = new THREE.Color(0,0,0);
g26.faces[2].color = new THREE.Color(0,0,0);
g26.faces[3].color = new THREE.Color(0,0,0);
g26.faces[4].color = new THREE.Color(0xffffff);
g26.faces[5].color = new THREE.Color(0xffffff);
g26.faces[6].color = new THREE.Color(0,0,0);
g26.faces[7].color = new THREE.Color(0,0,0);
g26.faces[8].color = new THREE.Color(0,1,0);
g26.faces[9].color = new THREE.Color(0,1,0);
g26.faces[10].color = new THREE.Color(0,0,0);
g26.faces[11].color = new THREE.Color(0,0,0);
var m26 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );

var g27 = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
g27.faces[0].color = new THREE.Color(0xFF8000);
g27.faces[1].color = new THREE.Color(0xFF8000);
g27.faces[2].color = new THREE.Color(0,0,0);
g27.faces[3].color = new THREE.Color(0,0,0);
g27.faces[4].color = new THREE.Color(0xffffff);
g27.faces[5].color = new THREE.Color(0xffffff);
g27.faces[6].color = new THREE.Color(0,0,0);
g27.faces[7].color = new THREE.Color(0,0,0);
g27.faces[8].color = new THREE.Color(0,1,0);
g27.faces[9].color = new THREE.Color(0,1,0);
g27.faces[10].color = new THREE.Color(0,0,0);
g27.faces[11].color = new THREE.Color(0,0,0);
var m27 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: THREE.FaceColors} );
}
    let cube = new Map([
	[1, [-1, -1, -1, g1, m1] ],
  	[2, [0, -1, -1, g2, m2] ],
  	[3, [1, -1, -1, g3, m3] ],
  	
    [4, [-1, 0, -1, g4, m4] ],
  	[5, [0, 0, -1, g5, m5] ],
  	[6, [1, 0, -1, g6, m6] ],
  	
    [7, [-1, 1, -1, g7, m7] ],
  	[8, [0, 1, -1, g8, m8] ],
  	[9, [1, 1, -1, g9, m9] ],
  
	
    [10, [-1, -1, 0, g10, m10] ],
  	[11, [0, -1, 0, g11, m11] ],
  	[12, [1, -1, 0, g12, m12] ],
  	
    [13, [-1, 0, 0, g13, m13] ],
  	[14, [0, 0, 0, g14, m14] ],
  	[15, [1, 0, 0, g15, m15] ],
  	
    [16, [-1, 1, 0, g16, m16] ],
  	[17, [0, 1, 0, g17, m17] ],
  	[18, [1, 1, 0, g18, m18] ],

  	
    [19, [-1, -1, 1, g19, m19] ],
  	[20, [0, -1, 1, g20, m20] ],
  	[21, [1, -1, 1, g21, m21] ],
  	
    [22, [-1, 0, 1, g22, m22] ],
  	[23, [0, 0, 1, g23, m23] ],
  	[24, [1, 0, 1, g24, m24] ],
  	
    [25, [-1, 1, 1, g25, m25] ],
  	[26, [0, 1, 1, g26, m26] ],
  	[27, [1, 1, 1, g27, m27] ]
    ]); 

	var flag =  new Boolean(false);

    for (var i = 1; i < 28 ; i++) {
      cube.get(i)[4].transparent = true;
      object = new THREE.Mesh(cube.get(i)[3], cube.get(i)[4]);

      object.scale.x = 0.95;
      object.scale.y = 0.95;
      object.scale.z = 0.95;

      object.position.x = cube.get(i)[0];
      object.position.y = cube.get(i)[1];
      object.position.z = cube.get(i)[2];
	  
	  object.className = "" + i;
	  
	  this.scene.add(object);
	  this.objects.push(object);
	  
	  flag = false;
    }


	this.dragControls = new THREE.DragControls(this.objects, this.camera, this.renderer.domElement);			
    this.dragControls.addEventListener( 'hoveron', this.onHoveron, false );
	this.dragControls.transformGroup = true;
  },
  
  addSkybox: function() {
    var iSBrsize = 500;
    var uniforms = {
      topColor: {type: "c", value: new THREE.Color(0x0077ff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
      offset: {type: "f", value: iSBrsize}, exponent: {type: "f", value: 1.5}
    }

    var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
    skyMat = new THREE.ShaderMaterial({vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false});
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  },
  
  onDocumentMouseDown: function (event) {
    event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y =  - ( event.clientY / window.innerHeight ) * 2 + 1;

    lesson10.raycaster.setFromCamera(  mouse, lesson10.camera );

    var intersects = lesson10.raycaster.intersectObjects(lesson10.objects, true);

    if (intersects.length > 0) {
		lesson10.controls.enabled = false;
    }

  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y =  - ( event.clientY / window.innerHeight ) * 2 + 1;

    lesson10.raycaster.setFromCamera(  mouse, lesson10.camera );

    var intersects = lesson10.raycaster.intersectObjects(lesson10.objects, true);

    if (intersects.length > 0) {
		lesson10.controls.enabled = false;
		
		var object = intersects[0].object;
		let vector = new THREE.Vector3();
		object.getWorldPosition(vector);
		
		if (filter(object.className,intersects[0].faceIndex)) {
			curInd.ind = object.className;
			curInd.faceInd = getFaceIndex(intersects[0].faceIndex);
			curInd.g = getType(curInd.ind);
			
			curInd.x = Math.round(vector.x);
			curInd.y = Math.round(vector.y);
			curInd.z = Math.round(vector.z);

			oldInd.ind = bufInd.ind;
			oldInd.faceInd = bufInd.faceInd;
			oldInd.g = bufInd.g;
			
			oldInd.x = bufInd.x;
			oldInd.y = bufInd.y;
			oldInd.z = bufInd.z;
		
			
			if (bufInd.ind != curInd.ind) {
				bufInd.x = Math.round(vector.x);
				bufInd.y = Math.round(vector.y);
				bufInd.z = Math.round(vector.z);
			
				

				console.clear();
				console.log(" cur: " + curInd.ind + " " + curInd.faceInd + " old: " + oldInd.ind + " " + oldInd.faceInd + " \r type: " + curInd.g + " " + oldInd.g );
				console.log(" cur coord: " + curInd.x + " " + curInd.y + " " + curInd.z );
				console.log(" old coord: " + oldInd.x + " " + oldInd.y + " " + oldInd.z );
				console.log(" rotators: " + rotateDelta.x + " " + rotateDelta.y + " " + rotateDelta.z );
				
				
				let vec = new THREE.Vector3();
				lesson10.group.getWorldPosition(vec);
				
				console.log(" group pos: " + lesson10.group.position.x + " " + lesson10.group.position.y + " " + lesson10.group.position.z );
				console.log(" group pos: " + vec.x + " " + vec.y + " " + vec.z );
				
				console.log(" group rot: " + lesson10.group.rotation.x + " " + lesson10.group.rotation.y + " " + lesson10.group.rotation.z );
				setDirect2(curInd,oldInd);
				
				bufInd.ind = object.className;
				
				bufInd.faceInd = getFaceIndex(intersects[0].faceIndex);
				bufInd.g = getType(bufInd.ind);
			} 
		}	

    } else {
		curInd.ind = 0;
		curInd.faceInd = 0;
	}
	
  },
  onDocumentMouseUp: function (event) {
	
	event.preventDefault();

    // Enable the controls
    lesson10.controls.enabled = true;
    lesson10.selection = null;
	
  },
  onHoveron: function ()  {
	
	var draggableObjects = lesson10.dragControls.getObjects();
	
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	lesson10.raycaster.setFromCamera( mouse, lesson10.camera );

	var intersections = lesson10.raycaster.intersectObjects( lesson10.objects, true );
	
	if ( intersections.length > 0 ) {
		
		var object = intersections[0].object;
	}
 } 
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
  
  rotator();
  
}

// Update controls and stats
function update() {
  var delta = lesson10.clock.getDelta();

  lesson10.controls.update(delta);
  lesson10.stats.update();
}

// Render the scene
function render() {
  if (lesson10.renderer) {
    lesson10.renderer.render(lesson10.scene, lesson10.camera);
  }
}

// Initialize lesson on page load
function initializeLesson() {
  lesson10.init();
  animate();
}
 
function filter(i,f) {
	var et;
	var s = Number.parseInt(i);
	switch (s) {
		case 1:
		  et = [2,3,6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 2: 
		  et = [6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 3: 
		  et = [0,1,6,7,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 4: 
		  et = [2,3,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 5: 
		  et = [10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 6: 
		  et = [0,1,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 7: 
		  et = [2,3,4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 8: 
		  et = [4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 9: 
		  et = [0,1,4,5,10,11];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 10: 
		  et = [2,3,6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 11: 
		  et = [6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 12: 
		  et = [0,1,6,7];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 13: 
		  et = [2,3];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 15: 
		  et = [0,1];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 16: 
		  et = [2,3,4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 17: 
		  et = [4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 18: 
		  et = [0,1,4,5];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 19: 
		  et = [2,3,6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 20: 
		  et = [6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 21: 
		  et = [0,1,6,7,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 22: 
		  et = [2,3,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 23: 
		  et = [8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 24: 
		  et = [0,1,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 25: 
		  et = [2,3,4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 26: 
		  et = [4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		case 27: 
		  et = [0,1,4,5,8,9];
		  if (et.indexOf(f) != -1) return true;
		break;
		return false;
	}
}

function getFaceIndex(i) {
	switch (i) {
		case 0:
		case 1:
			return 1;
		break;
		case 2:
		case 3:
			return 2;
		break;
		case 4:
		case 5:
			return 3;
		break;
		case 6:
		case 7:
			return 4;
		break;
		case 8:
		case 9:
			return 5;
		break;
		case 10:
		case 11:
			return 6;
		break;
		return -1;
	}
}	


function setDirect2(c,o){
	if (!rotate) {
		if (c.x == 1 && o.x == 1 ) {
					
			if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
				if (c.y - o.y < 0 && c.z == 0 && o.z == 0)	{
					setGroup(3,-0.01,0);
				}  else 
				if (c.z - o.z > 0 && c.y == 0 && o.y == 0)	{
					setGroup(2,-0.01,0);
				} 
				if (c.y - o.y > 0 && c.z == 0 && o.z == 0)	{
					setGroup(3,0.01,0);
				}  else 
				if (c.z - o.z < 0 && c.y == 0 && o.y == 0)	{
					setGroup(2,0.01,0);
				} 
			}

			if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
				if (c.y - o.y < 0 && c.z == 1 && o.z == 1)	{
					setGroup(3,-0.01,1);
				}  else 
				if (c.z - o.z > 0 && c.y == 1 && o.y == 1)	{
					setGroup(2,-0.01,1);
				} 
				if (c.y - o.y > 0 && c.z == 1 && o.z == 1)	{
					setGroup(3,0.01,1);
				}  else 
				if (c.z - o.z < 0 && c.y == 1 && o.y == 1)	{
					setGroup(2,0.01,1);
				} 

				if (c.y - o.y < 0 && c.z == -1 && o.z == -1)	{
					setGroup(3,-0.01,-1);
				}  else 
				if (c.z - o.z > 0 && c.y == -1 && o.y == -1)	{
					setGroup(2,-0.01,-1);
				} 
				if (c.y - o.y > 0 && c.z == -1 && o.z == -1)	{
					setGroup(3,0.01,-1);
				}  else 
				if (c.z - o.z < 0 && c.y == -1 && o.y == -1)	{
					setGroup(2,0.01,-1);
				} 
			}
		}
/*
		if (c.z == 1 && o.z == 1) {
					
			if ((c.g == 1 && o.g == 2 ) || c.g == 2 && o.g == 1) {
				if (c.y - o.y < 0 && c.z == 0 && o.z == 0)	{
					setGroup(3,-0.01,0);
				}  else 
				if (c.z - o.z > 0 && c.y == 0 && o.y == 0)	{
					setGroup(2,-0.01,0);
				} 
				if (c.y - o.y > 0 && c.z == 0 && o.z == 0)	{
					setGroup(3,0.01,0);
				}  else 
				if (c.z - o.z < 0 && c.y == 0 && o.y == 0)	{
					setGroup(2,0.01,0);
				} 
			}

			if ((c.g == 2 && o.g == 3 ) || c.g == 3 && o.g == 2) {
				if (c.y - o.y < 0 && c.z == 1 && o.z == 1)	{
					setGroup(3,-0.01,1);
				}  else 
				if (c.z - o.z > 0 && c.y == 1 && o.y == 1)	{
					setGroup(2,-0.01,1);
				} 
				if (c.y - o.y > 0 && c.z == 1 && o.z == 1)	{
					setGroup(3,0.01,1);
				}  else 
				if (c.z - o.z < 0 && c.y == 1 && o.y == 1)	{
					setGroup(2,0.01,1);
				} 

				if (c.y - o.y < 0 && c.z == -1 && o.z == -1)	{
					setGroup(3,-0.01,-1);
				}  else 
				if (c.z - o.z > 0 && c.y == -1 && o.y == -1)	{
					setGroup(2,-0.01,-1);
				} 
				if (c.y - o.y > 0 && c.z == -1 && o.z == -1)	{
					setGroup(3,0.01,-1);
				}  else 
				if (c.z - o.z < 0 && c.y == -1 && o.y == -1)	{
					setGroup(2,0.01,-1);
				} 
			}
		}
	*/
	}
}

function setDirect(oi, ofi, ci, cfi) {

	// layer one

	if (ci == 12 && oi == 3 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};
	
	if (ci == 3 && oi == 12 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,0.01,-1);
	};
	
	if (ci == 21 && oi == 12 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};

	if (ci == 12 && oi == 21 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,0.01,-1);
	};



	if (ci == 10 && oi == 19 && cfi == 2 && ofi == 2 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};
	
	if (ci == 19 && oi == 10 && cfi == 2 && ofi == 2 && rotate == false) {
	  setGroup(2,0.01,-1);
	};
	
	if (ci == 10 && oi == 1 && cfi == 2 && ofi == 2 && rotate == false) {
	  setGroup(2,0.01,-1);
	};

	if (ci == 1 && oi == 10 && cfi == 2 && ofi == 2 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};



	if (ci == 20 && oi == 21 && cfi == 5 && ofi == 5 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};
	
	if (ci == 21 && oi == 20 && cfi == 5 && ofi == 5 && rotate == false) {
	  setGroup(2,0.01,-1);
	};
	
	if (ci == 19 && oi == 20 && cfi == 5 && ofi == 5 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};

	if (ci == 20 && oi == 19 && cfi == 5 && ofi == 5 && rotate == false) {
	  setGroup(2,0.01,-1);
	};



	if (ci == 2 && oi == 1 && cfi == 6 && ofi == 6 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};
	
	if (ci == 1 && oi == 2 && cfi == 6 && ofi == 6 && rotate == false) {
	  setGroup(2,0.01,-1);
	};
	
	if (ci == 3 && oi == 2 && cfi == 6 && ofi == 6 && rotate == false) {
	  setGroup(2,-0.01,-1);
	};

	if (ci == 2 && oi == 3 && cfi == 6 && ofi == 6 && rotate == false) {
	  setGroup(2,0.01,-1);
	};
	
	//layer two

	if (ci == 6 && oi == 15 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,0.01,0);
	};
	
	if (ci == 15 && oi == 6 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,-0.01,0);
	};
	
	if (ci == 15 && oi == 24 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,0.01,0);
	};

	if (ci == 24 && oi == 15 && cfi == 1 && ofi == 1 && rotate == false) {
	  setGroup(2,-0.01,0);
	};
}
 
function setGroup(selector, delta, position) {
	
	ungroup();
	
	for (let objIndex in lesson10.objects) {
		let obj = lesson10.objects[objIndex];
		
		rotateDelta.x = 0;
		rotateDelta.y = 0;
		rotateDelta.z = 0;
		
		switch (selector) {
			case 1:
				rotateDelta.x = delta;
				if (obj.position.x == position) {
					lesson10.group.attach(obj);
					lesson10.group.add(obj);
				}
			break;
			case 2:
				rotateDelta.y = delta;
				if (obj.position.y == position) {
					lesson10.group.attach(obj);
					lesson10.group.add(obj);
				}
			break;
			case 3:
				rotateDelta.z = delta;
				if (obj.position.z == position) {
					lesson10.group.attach(obj);
					lesson10.group.add(obj);
				}
			break;
		}
	}
	
	rotate = true;
}	

function rotator() {
  let rx = lesson10.group.rotation.x;
  let ry = lesson10.group.rotation.y; 
  let rz = lesson10.group.rotation.z;

  if (rotate) {
	
	lesson10.group.rotation.x += rotateDelta.x;
	lesson10.group.rotation.y += rotateDelta.y;
	lesson10.group.rotation.z += rotateDelta.z;
	
  }
 
  
  if ((Math.trunc(rx * 100) == -1 * 157) /*&& !(Math.trunc(rx * 100) == oldRot.xx)*/) {
			
	if (Math.trunc(rx * 100) == -1 * 157)	lesson10.group.rotation.x = -1 * 1.57;  
	oldRot.x = Math.trunc(lesson10.group.rotation.x * 100);
	rotate = false;
  }
  
  if ((Math.trunc(rx * 100) == 1 * 157) /*&& !(Math.trunc(rx * 100) == oldRot.x)*/) {
			
	if (Math.trunc(rx * 100) == 1 * 157)	lesson10.group.rotation.x = 1 * 1.57;  
	oldRot.x = Math.trunc(lesson10.group.rotation.x * 100);	
	rotate = false;
  }

if ((Math.trunc(ry * 100) == -1 * 157) /*&& !(Math.trunc(ry * 100) == oldRot.y)*/) {
			
	if (Math.trunc(ry * 100) == -1 * 157)	lesson10.group.rotation.y = -1 * 1.57;  
	oldRot.y = Math.trunc(lesson10.group.rotation.y * 100);
	rotate = false;
  }
  
  if ((Math.trunc(ry * 100) == 1 * 157) /*&& !(Math.trunc(ry * 100) == oldRot.y)*/) {
			
	if (Math.trunc(ry * 100) == 1 * 157) lesson10.group.rotation.y = 1 * 1.57;  
	oldRot.y = Math.trunc(lesson10.group.rotation.y * 100);	
	rotate = false;
  }

if ((Math.trunc(rz * 100) == -1 * 157) /*&& !(Math.trunc(rz * 100) == oldRot.z)*/) {
			
	if (Math.trunc(rz * 100) == -1 * 157) lesson10.group.rotation.z = -1 * 1.57;  
	oldRot.z = Math.trunc(lesson10.group.rotation.z * 100);
	rotate = false;
  }
  
  if ((Math.trunc(rz * 100) == 1 * 157) /*&& !(Math.trunc(rz * 100) == oldRot.z)*/) {
			
	if (Math.trunc(rz * 100) == 1 * 157) lesson10.group.rotation.z = 1 * 1.57;  
	oldRot.z = Math.trunc(lesson10.group.rotation.z * 100);	
	rotate = false;
  }

 
}

function rotator2() {
  let rx = lesson10.group.rotation.x;
  let ry = lesson10.group.rotation.y; 
  let rz = lesson10.group.rotation.z;

  if (rotate) {
	
	lesson10.group.rotation.x += rotateDelta.x;
	lesson10.group.rotation.y += rotateDelta.y;
	lesson10.group.rotation.z += rotateDelta.z;
	/*
	oldRot.x = 0;
	oldRot.y = 0;
	oldRot.z = 0;
	*/
  }
 
  
  if (((Math.trunc(rx * 100) == 0) ||
	   (Math.trunc(rx * 100) == -1 * 157) || 
	   (Math.trunc(rx * 100) == -2 * 157) || 
	   (Math.trunc(rx * 100) == -3 * 157) || 
	   (Math.trunc(rx * 100) == -4 * 157)) && !(Math.trunc(rx * 100) == oldRot.x)) {
			
	if (Math.trunc(rx * 100) == -1 * 157)	lesson10.group.rotation.x = -1 * 1.57;  
	if (Math.trunc(rx * 100) == -2 * 157)	lesson10.group.rotation.x = -2 * 1.57;  
	if (Math.trunc(rx * 100) == -3 * 157)	lesson10.group.rotation.x = -3 * 1.57;
	oldRot.x = Math.trunc(lesson10.group.rotation.x * 100);
	rotate = false;
  }
  
  if (((Math.trunc(rx * 100) == 0) ||
	   (Math.trunc(rx * 100) == 1 * 157) || 
	   (Math.trunc(rx * 100) == 2 * 157) || 
	   (Math.trunc(rx * 100) == 3 * 157) || 
	   (Math.trunc(rx * 100) == 4 * 157)) && !(Math.trunc(rx * 100) == oldRot.x)) {
			
	if (Math.trunc(rx * 100) == 1 * 157)	lesson10.group.rotation.x = 1 * 1.57;  
	if (Math.trunc(rx * 100) == 2 * 157)	lesson10.group.rotation.x = 2 * 1.57;  
	if (Math.trunc(rx * 100) == 3 * 157)	lesson10.group.rotation.x = 3 * 1.57; 
	oldRot.x = Math.trunc(lesson10.group.rotation.x * 100);	
	rotate = false;
  }

  if (rx < - 4 * 1.57) lesson10.group.rotation.x = 0;
  if (rx >  4 * 1.57) lesson10.group.rotation.x = 0;

 
  if (((Math.trunc(ry * 100) == 0) ||
	   (Math.trunc(ry * 100) == -1 * 157) || 
	   (Math.trunc(ry * 100) == -2 * 157) || 
	   (Math.trunc(ry * 100) == -3 * 157) || 
	   (Math.trunc(ry * 100) == -4 * 157)) && !(Math.trunc(ry * 100) == oldRot.y)) {
			
	if (Math.trunc(ry * 100) == -1 * 157)	lesson10.group.rotation.y = -1 * 1.57;  
	if (Math.trunc(ry * 100) == -2 * 157)	lesson10.group.rotation.y = -2 * 1.57;  
	if (Math.trunc(ry * 100) == -3 * 157)	lesson10.group.rotation.y = -3 * 1.57;
	oldRot.y = Math.trunc(lesson10.group.rotation.y * 100);
	rotate = false;
  }
  if (((Math.trunc(ry * 100) == 0) ||
	   (Math.trunc(ry * 100) == 1 * 157) || 
	   (Math.trunc(ry * 100) == 2 * 157) || 
	   (Math.trunc(ry * 100) == 3 * 157) || 
	   (Math.trunc(ry * 100) == 4 * 157)) && !(Math.trunc(ry * 100) == oldRot.y)) {
			
	if (Math.trunc(ry * 100) == 1 * 157)	lesson10.group.rotation.y = 1 * 1.57;  
	if (Math.trunc(ry * 100) == 2 * 157)	lesson10.group.rotation.y = 2 * 1.57;  
	if (Math.trunc(ry * 100) == 3 * 157)	lesson10.group.rotation.y = 3 * 1.57; 
	oldRot.y = Math.trunc(lesson10.group.rotation.y * 100);	
	rotate = false;
  }

  if (ry < - 4 * 1.57) lesson10.group.rotation.y = 0;
  if (ry >  4 * 1.57) lesson10.group.rotation.y = 0;
 
  if (((Math.trunc(rz * 100) == 0) ||
	   (Math.trunc(rz * 100) == -1 * 157) || 
	   (Math.trunc(rz * 100) == -2 * 157) || 
	   (Math.trunc(rz * 100) == -3 * 157) || 
	   (Math.trunc(rz * 100) == -4 * 157)) && !(Math.trunc(rz * 100) == oldRot.z)) {
			
	if (Math.trunc(rz * 100) == -1 * 157)	lesson10.group.rotation.z = -1 * 1.57;  
	if (Math.trunc(rz * 100) == -2 * 157)	lesson10.group.rotation.z = -2 * 1.57;  
	if (Math.trunc(rz * 100) == -3 * 157)	lesson10.group.rotation.z = -3 * 1.57;
	oldRot.z = Math.trunc(lesson10.group.rotation.z * 100);
	rotate = false;
  }
  
  if (((Math.trunc(rz * 100) == 0) ||
	   (Math.trunc(rz * 100) == 1 * 157) || 
	   (Math.trunc(rz * 100) == 2 * 157) || 
	   (Math.trunc(rz * 100) == 3 * 157) || 
	   (Math.trunc(rz * 100) == 4 * 157)) && !(Math.trunc(rz * 100) == oldRot.z)) {
			
	if (Math.trunc(rz * 100) == 1 * 157)	lesson10.group.rotation.z = 1 * 1.57;  
	if (Math.trunc(rz * 100) == 2 * 157)	lesson10.group.rotation.z = 2 * 1.57;  
	if (Math.trunc(rz * 100) == 3 * 157)	lesson10.group.rotation.z = 3 * 1.57; 
	oldRot.z = Math.trunc(lesson10.group.rotation.z * 100);	
	rotate = false;
  }

  if (rz < - 4 * 1.57) lesson10.group.rotation.z = 0;
  if (rz >  4 * 1.57) lesson10.group.rotation.z = 0;
}

function ungroup() {
		if (lesson10.group.children.length == 0) {
			lesson10.group.rotation.x = 0;
			lesson10.group.rotation.y = 0;
			lesson10.group.rotation.z = 0;
			return;
		}
		
        for (var i = 8; i > -1; i--) {
     
            var gg = lesson10.group.children[i]; 
            
            let vector = new THREE.Vector3();
            let quat = new THREE.Quaternion();
            
            gg.getWorldPosition(vector);
            gg.getWorldQuaternion(quat);
            
            lesson10.group.remove(gg);
            lesson10.scene.attach(gg);
            
            gg.position.x = Math.round(vector.x);
            gg.position.y = Math.round(vector.y);
            gg.position.z = Math.round(vector.z);

            let rotation = new THREE.Euler()
            rotation.setFromQuaternion(quat)

            gg.rotation.x = rotation.x ;
            gg.rotation.y = rotation.y ;
            gg.rotation.z = rotation.z ;
			gg = null;
        };
		
		/*
		lesson10.group.x = 0;
		lesson10.group.y = 0;
		lesson10.group.z = 0;
		*/
		
		if (lesson10.group.children.length == 0) {
			lesson10.group.rotation.x = 0;
			lesson10.group.rotation.y = 0;
			lesson10.group.rotation.z = 0;
			return;
		}
		
}

function getType(inp) {
	
	let s = ['5','11','13','15','17','23'];
	
	if (s.indexOf(inp)  != -1) {
		return 1;
	}
	
	if (inp % 2 == 0) {
		return 2;
	}
	
	return 3;
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
