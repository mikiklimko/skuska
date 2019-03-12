var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {
    color: "#ff0000", 
    wireframe: true 
});
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

    camera.position.x = 2;
    camera.position.y = 1, 2;
    camera.position.z = 4;
	
gui = new dat.GUI();
var speed = 0.1;
	parameters = 
	{
        tvar: "Kocka",
		x: 1, y: 1, z: 1,
        color: "#ff0000", // color (change "#" to "0x")
        wireframe: true, 
        poz1: 1 , poz2: 1 , poz3: 1,  
		
		
	};

    var typ = gui.add(parameters, 'tvar', ["Kocka", "Ihlan" ]).name('Objekt');
    typ.onChange(function (geom) { 
        if (geom === "Kocka"){
            cube.visible = true;
            cone.visible = false;
        } 
        if (geom === "Ihlan"){
            cube.visible = false;
            cone.visible = true;
        } 
        console.log(geom)
        
     });

    

     var color = gui.addColor(parameters,'color').name("Farba");
     color.onChange(function (color) { cube.material.color.setHex(color.replace("#", "0x")); });         
     
     var dimen = gui.addFolder('Pohyb');
    var xdimen = dimen.add(parameters, 'x').min(1).max(20).step(speed).name('os-X');
    var ydimen = dimen.add(parameters, 'y').min(1).max(20).step(speed).name('os-Y');
    var zdimen = dimen.add(parameters, 'z').min(1).max(20).step(speed).name('os-Z');
    
    xdimen.onChange(function (pohyb) { cube.scale.x = pohyb; });
    ydimen.onChange(function (pohyb) { cube.scale.y = pohyb; });
    zdimen.onChange(function (pohyb) { cube.scale.z = pohyb; });


    var pos = gui.addFolder("Pozicia");
    var xpos = pos.add (parameters, 'poz1').min(-10).max(20).step(speed).name('os-X');
    var ypos = pos.add (parameters, 'poz2').min(-10).max(20).step(speed).name('os-Y');
    var zpos = pos.add (parameters, 'poz3').min(-10).max(20).step(speed).name('os-Z');

    xpos.onChange(function(pozicia){cube.position.x = pozicia});
    ypos.onChange(function(pozicia){cube.position.y = pozicia});
    zpos.onChange(function(pozicia){cube.position.z = pozicia});