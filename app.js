var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 30;

var	scene = new THREE.Scene();


var	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setClearColor( 0x000000, 1 );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
   
    
    var controls;
    controls = new THREE.OrbitControls( camera );
    
     





var animate = function () {
    requestAnimationFrame( animate );

   

    renderer.render( scene, camera );
};

animate();