

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1000 );
	camera.position.z = 30;

var	scene = new THREE.Scene();


var	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setClearColor( 0x000000, 1 );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
   
    
    var controls;
    controls = new THREE.OrbitControls( camera , renderer.domElement);
    
    var xro,zro,yro; 

    function spin(varname, xaxis, yaxis, zaxis) {

        var speed = 0.01;
    
        if (varname == true) {
    
            if (xaxis == true) { cube.rotation.x += speed; }
            else if (yaxis == true) { cube.rotation.y += speed; }
            else cube.rotation.z += speed;
        }
    }
    


var animate = function () {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );

    spin(xro, true, false, false);
    spin(yro, false, true, false);
    spin(zro, false, false, true);
};

animate();