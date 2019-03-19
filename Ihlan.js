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
 


var color = color.onChange(function (color) { cone.material.color.setHex(color.replace("#", "0x")); });



xdimen.onChange(function (pohyb) { cone.scale.x = pohyb; });
ydimen.onChange(function (pohyb) { cone.scale.y = pohyb; });
zdimen.onChange(function (pohyb) { cone.scale.z = pohyb; });




xpos.onChange(function (pozicia) { cone.position.x = pozicia });
ypos.onChange(function (pozicia) { cone.position.y = pozicia });
zpos.onChange(function (pozicia) { cone.position.z = pozicia });




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