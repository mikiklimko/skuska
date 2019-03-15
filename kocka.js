var geometry = new THREE.BoxGeometry(5, 5, 5);
var material = new THREE.MeshBasicMaterial({
    color: "#ff0000",
    wireframe: true
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 10;


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
    
//Nefunguje zmena tvaru




 var typ = gui.add(parameters, 'tvar', ["Kocka", "Ihlan", "Valec"]).name('Objekt');

 typ.onChange(function (geom) {
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
 


var color = gui.addColor(parameters, 'color').name("Farba");
color.onChange(function (color) { cube.material.color.setHex(color.replace("#", "0x")); });

var dimen = gui.addFolder('Nastavenia');
var xdimen = dimen.add(parameters, 'x').min(1).max(20).step(speed).name('os-X');
var ydimen = dimen.add(parameters, 'y').min(1).max(20).step(speed).name('os-Y');
var zdimen = dimen.add(parameters, 'z').min(1).max(20).step(speed).name('os-Z');

xdimen.onChange(function (pohyb) { cube.scale.x = pohyb; });
ydimen.onChange(function (pohyb) { cube.scale.y = pohyb; });
zdimen.onChange(function (pohyb) { cube.scale.z = pohyb; });


var pos = gui.addFolder("Pozicia");
var xpos = pos.add(parameters, 'poz1').min(-10).max(20).step(speed).name('os-X');
var ypos = pos.add(parameters, 'poz2').min(-10).max(20).step(speed).name('os-Y');
var zpos = pos.add(parameters, 'poz3').min(-10).max(20).step(speed).name('os-Z');

xpos.onChange(function (pozicia) { cube.position.x = pozicia });
ypos.onChange(function (pozicia) { cube.position.y = pozicia });
zpos.onChange(function (pozicia) { cube.position.z = pozicia });


var anim = gui.addFolder('Animacia');
var xanim = anim.add(parameters, 'ani1').name('os-X');
var yanim = anim.add(parameters, 'ani2').name('os-Y');
var zanim = anim.add(parameters, 'ani3').name('os-Z');

xanim.onChange(function (anim) { xro = anim; });
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

    gui.add(obj,'restart');



gui.open();

