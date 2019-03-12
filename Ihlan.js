var geometry = new THREE.ConeGeometry( 2.5, 10, 16 );
var material = new THREE.MeshBasicMaterial( {color: "red",
wireframe: true
});
var cone = new THREE.Mesh( geometry, material );
scene.add( cone );

camera.position.z = 10;
camera.position.y = 0;
camera.position.x = 0;


