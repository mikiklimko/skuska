var geometry = new THREE.ConeGeometry( 5, 20, 32 );
var material = new THREE.MeshBasicMaterial( {color: "#ff0000",
wireframe: true
});
var cone = new THREE.Mesh( geometry, material );
scene.add( cone );