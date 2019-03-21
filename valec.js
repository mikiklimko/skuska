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



xdimen.onChange(function (pohyb3) { cylinder.scale.x = pohyb3; });
ydimen.onChange(function (pohyb3) { cylinder.scale.y = pohyb3; });
zdimen.onChange(function (pohyb3) { cylinder.scale.z = pohyb3; });




xpos.onChange(function (pozicia3) { cylinder.position.x = pozicia3 });
ypos.onChange(function (pozicia3) { cylinder.position.y = pozicia3 });
zpos.onChange(function (pozicia3) { cylinder.position.z = pozicia3 });




xanim.onChange(function (anim3) { xro = anim3; console.log(anim) } );
yanim.onChange(function (anim3) { yro = anim3; });
zanim.onChange(function (anim3) { zro = anim3; });

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