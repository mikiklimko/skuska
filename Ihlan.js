var geometry = new THREE.ConeGeometry( 2.5, 10, 16 );
var material = new THREE.MeshBasicMaterial( {color: "red",
wireframe: true
});
var cone = new THREE.Mesh( geometry, material );
scene.add( cone );

cone.visible = false;
camera.position.z = 15;
camera.position.y = 0;
camera.position.x = 0;


var gui = new dat.GUI();
var speed = 0.1;
parameters =
    {
        a:"",
        tvar: "Kocka",
        x: 1, y: 1, z: 1,
        color: "#ff0000", // color (change "#" to "0x")
        wireframe: true,
        poz1: 1, poz2: 1, poz3: 1,
        ani1: false, ani2: false, ani3: false,
        

    };