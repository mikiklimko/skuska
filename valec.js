var geometry3 = new THREE.CylinderGeometry( 2.5, 2.5, 10, 16 );
var material3 = new THREE.MeshBasicMaterial( {color: "red",
wireframe: true 
});
var cylinder = new THREE.Mesh( geometry3, material3 );
scene.add( cylinder ); 

cylinder.visible = false;


var typ =   typ.onChange(function (geom) {
    if (geom === "Kocka") {
        cube.visible = true;
        cone.visible = false;
        cylinder.visible = false;
    }
    if (geom === "Ihlan") {
        cube.visible = false;
        cone.visible = true;
        cylinder.visible = false;
    }
    if (geom === "Valec"){
        cube.visible = false;
        cone.visible = false;
        cylinder.visible = true;
    }
    console.log(geom)

});
 


var color = color.onChange(function (color) { cylinder.material.color.setHex(color.replace("#", "0x")); });



xdimen.onChange(function (pohyb) { cylinder.scale.x = pohyb; });
ydimen.onChange(function (pohyb) { cylinder.scale.y = pohyb; });
zdimen.onChange(function (pohyb) { cylinder.scale.z = pohyb; });




xpos.onChange(function (pozicia) { cylinder.position.x = pozicia });
ypos.onChange(function (pozicia) { cylinder.position.y = pozicia });
zpos.onChange(function (pozicia) { cylinder.position.z = pozicia });




xanim.onChange(function (anim) { xro = anim; console.log(anim) } );
yanim.onChange(function (anim) { yro = anim; });
zanim.onChange(function (anim) { zro = anim; });

var obj = { restart:function(){ 
    camera.position.z = 3;
    cube.scale.x = 1 ;
    cube.scale.z = 1 ;
    cube.scale.y = 1 ;
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = 0;
    

 }};

    



gui.open();