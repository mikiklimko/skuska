var geometry3 = new THREE.CylinderGeometry( 2.5, 2.5, 10, 16 );
var material3 = new THREE.MeshBasicMaterial( {color: "red",
wireframe: true 
});
var cylinder = new THREE.Mesh( geometry3, material3 );
scene.add( cylinder ); 

cylinder.visible = false;