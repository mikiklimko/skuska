// Hlavna trieda s implementaciou metod pre vizualizaciu
let parameters = {
    a: "",
    tvar: "Kocka",
    x: 1,
    y: 1,
    z: 1,
    color: "#ff0000",
    wireframe: true,
    poz1: 1,
    poz2: 1,
    poz3: 1,
    ani1: false,
    ani2: false,
    ani3: false,
    speed: 0.001,
    xro: false,
    opacity: 1,
  };
  
  class Viz {
    constructor() {
      // () => aby parameter odkazoval na class
      this.initCube = this.initCube.bind(this);
      this.initCone = this.initCone.bind(this);
      this.initCylinder = this.initCylinder.bind(this);
      this.initOctahedron = this.initOctahedron.bind(this);
      this.initIco = this.initIco.bind(this);
      this.initTetra = this.initTetra.bind(this);
     // this.initPoly = this.initPoly.bind(this);
      this.initGUI = this.initGUI.bind(this);
      this.setActive = this.setActive.bind(this);
      this.spin = this.spin.bind(this);
  
      // Zakladne jadro programu, ktore nastavi prostredie
      this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000);
      // oddialenie kamery (aby bolo vidno objekty pred nou)
      this.camera.position.z = 15;
      this.camera.position.y = 1.5;
      this.camera.rotation.x = 0;
      // this.camera.updateProjectionMatrix()
      // this.camera.up = new THREE.Vector3(0, 0, 0);
  
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x505050);
  
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
  
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.setPixelRatio(window.devicePixelRatio);
  
      document.body.appendChild(this.renderer.domElement);
  
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableZoom = true;
      this.controls.enablePan = true;
      this.controls.enableDamping = true;
      this.controls.rotateSpeed = -0.25;
  
      document.body.appendChild(WEBVR.createButton(this.camera, this.renderer));
      // this.renderer.vr.enabled = false;
  
      var room;
      room = new THREE.LineSegments(new THREE.BoxLineGeometry(40, 40, 40, 10, 10, 10), new THREE.LineBasicMaterial({ color: 0x808080 }));
      room.position.y = 3;
      this.scene.add(room);
  
      // Geometrie (na zaciatku neexistuju, ale implementujeme metody, ktore ich nastavia)
      this.geometries = {
        cube: null,
        cone: null,
        cylinder: null,
        octahedron: null,
        ico: null,
        tetra: null,
        //poly: null,
      };
  
      // Kym nemame inicializovane ziadne geometrie, ziadna teda nemoze byt aktivna
      this.activeGeometry = null;
  
      // Svetla
      var ambientLight = new THREE.AmbientLight(0x000000);
      this.scene.add(ambientLight);
  
      var lights = [];
      lights[0] = new THREE.PointLight(0xffffff, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);
  
      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);
  
      this.scene.add(lights[0]);
      this.scene.add(lights[1]);
      this.scene.add(lights[2]);
  
      // inicializacia vsetkych geometrii
      this.initCube();
      this.initCone();
      this.initCylinder();
      this.initOctahedron();
      this.initIco();
      this.initTetra();
     // this.initPoly();
  
      // Na zaciatku bude aktivna kocka
      this.setActive("Kocka");
  
      // Inicializacia dat.gui
      this.initGUI();
    }
  
    initGUI() {
      this.gui = new dat.GUI();
      this.typ = this.gui.add(parameters, "tvar", ["Kocka", "Ihlan", "Valec", "Tetrahedron", "Octahedron", "Icoshedron"]).name("Objekt");
      // Zmena parametru Objekt ("Kocka", "Ihlan" alebo "Valec") bude rovno
      // zavolana ako atribut `geometryType` metodou this.setActive(geometryType)
      this.typ.onChange(this.setActive);
  
      this.wireframe = this.gui.add(parameters, "wireframe").name("Wireframe");
      this.wireframe.onChange(checked => {
        Object.values(this.geometries).forEach(function(geom) {
          geom.material.wireframe = checked;
        });
      });
  
      this.opacity = this.gui
        .add(parameters, "opacity")
        .name("Priehladnost")
        .min(0)
        .max(1)
        .step(0.1);
      this.opacity.onChange(opacity => {
        this.geometries[this.activeGeometry].material.opacity = opacity;
      });
  
      this.color = this.gui.addColor(parameters, "color").name("Farba");
      this.color.onChange(color => {
        this.geometries[this.activeGeometry].material.color.setHex(color.replace("#", "0x"));
      });
  
      var dimen = this.gui.addFolder("Nastavenia");
      var xdimen = dimen
        .add(parameters, "x")
        .min(1)
        .max(20)
        .step(0.1)
        .name("os-X");
      var ydimen = dimen
        .add(parameters, "y")
        .min(1)
        .max(20)
        .step(0.1)
        .name("os-Y");
      var zdimen = dimen
        .add(parameters, "z")
        .min(1)
        .max(20)
        .step(0.1)
        .name("os-Z");
  
      xdimen.onChange(pohyb => {
        this.geometries[this.activeGeometry].scale.x = pohyb;
        this.geometries[this.activeGeometry].line.scale.x = pohyb;
      });
      ydimen.onChange(pohyb => {
        this.geometries[this.activeGeometry].scale.y = pohyb;
        this.geometries[this.activeGeometry].line.scale.y = pohyb;
      });
      zdimen.onChange(pohyb => {
        this.geometries[this.activeGeometry].scale.z = pohyb;
        this.geometries[this.activeGeometry].line.scale.z = pohyb;
      });
  
      var pos = this.gui.addFolder("Pozicia");
      var xpos = pos
        .add(parameters, "poz1")
        .min(-10)
        .max(20)
        .step(0.1)
        .name("os-X");
      var ypos = pos
        .add(parameters, "poz2")
        .min(-10)
        .max(20)
        .step(0.1)
        .name("os-Y");
      var zpos = pos
        .add(parameters, "poz3")
        .min(-10)
        .max(20)
        .step(0.1)
        .name("os-Z");
  
      xpos.onChange(pozicia => {
        this.geometries[this.activeGeometry].position.x = pozicia;
        this.geometries[this.activeGeometry].line.position.x = pozicia;
      });
      ypos.onChange(pozicia => {
        this.geometries[this.activeGeometry].position.y = pozicia;
        this.geometries[this.activeGeometry].line.position.y = pozicia;
      });
      zpos.onChange(pozicia => {
        this.geometries[this.activeGeometry].position.z = pozicia;
        this.geometries[this.activeGeometry].line.position.z = pozicia;
      });
  
      var anim = this.gui.addFolder("Animacia");
      var xanim = anim.add(parameters, "ani1").name("os-X");
      var yanim = anim.add(parameters, "ani2").name("os-Y");
      var zanim = anim.add(parameters, "ani3").name("os-Z");
  
      xanim.onChange(function(anim) {
        parameters.ani1 = anim;
      });
      yanim.onChange(function(anim) {
        parameters.ani2 = anim;
      });
      zanim.onChange(function(anim) {
        parameters.ani3 = anim;
      });
  
      this.speed = this.gui
        .add(parameters, "speed")
        .min(0)
        .max(0.1)
        .step(0.001)
        .name("Rychlost animacie");
  
      var restartOptions = {
        restart: () => {
          this.camera.position.z = 15;
  
          // nastav vsetkym geometriam zakladne nastavenia (zresetuj)
          Object.entries(this.geometries).forEach(function([key, geom]) {
            console.log(geom)
            geom.scale.x = geom.line.scale.x = 1;
            geom.scale.z = geom.line.scale.z = 1;
            geom.scale.y = geom.line.scale.y = 1;
            geom.position.x = geom.line.position.x = 0;
            geom.position.y = geom.line.position.y = 0;
            geom.position.z = geom.line.position.z = 0;
          });
        },
      };
  
      this.gui.add(restartOptions, "restart");
  
      this.gui.open();
    }
  
    initCube() {
      var geometry = new THREE.BoxBufferGeometry(5, 5, 5);
      var material = new THREE.MeshPhongMaterial({
        color: "#ff0000",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.cube = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.cube);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.cube.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.cube.line);
    }
  
    initCone() {
      var geometry = new THREE.ConeBufferGeometry(2.5, 10, 16);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.cone = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.cone);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.cone.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.cone.line);
    }
  
    initCylinder() {
      var geometry = new THREE.CylinderBufferGeometry(2.5, 2.5, 10, 16);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.cylinder = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.cylinder);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.cylinder.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.cylinder.line);
    }
    initOctahedron() {
      var geometry = new THREE.OctahedronBufferGeometry(3, 0);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.octahedron = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.octahedron);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.octahedron.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.octahedron.line);
    }
    initIco() {
      var geometry = new THREE.IcosahedronBufferGeometry(6, 0);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.ico = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.ico);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.ico.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.ico.line);
    }
  
    initTetra() {
      var geometry = new THREE.TetrahedronBufferGeometry(6, 0);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.tetra = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.tetra);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.tetra.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.tetra.line);
    }
  
    /* initPoly() {
      var verticesOfCube = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1];
  
      var indicesOfFaces = [2, 1, 0, 0, 3, 2, 0, 4, 7, 7, 3, 0, 0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1, 2, 3, 7, 7, 6, 2, 4, 5, 6, 6, 7, 4];
  
      var geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, 6, 2);
      var material = new THREE.MeshPhongMaterial({
        color: "red",
        wireframe: true,
        transparent: true,
      });
  
      this.geometries.poly = new THREE.Mesh(geometry, material);
      this.scene.add(this.geometries.poly);
  
      var edges = new THREE.EdgesGeometry(geometry);
      this.geometries.poly.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      this.scene.add(this.geometries.poly.line);
    } */
  
    setActive(geometryType) {
      switch (geometryType) {
        case "Ihlan":
         // this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = true;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "cone";
          break;
        case "Valec":
         // this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = true;
          this.activeGeometry = "cylinder";
          break;
        case "Octahedron":
        //  this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = true;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "octahedron";
          break;
        case "Icoshedron":
         // this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = true;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "ico";
          break;
        case "Tetrahedron":
         // this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = true;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "tetra";
          break;
        /* case "Polyhedron":
          this.geometries.poly.visible = this.geometries.poly.line.visible = true;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = false;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "poly";
          break; */
        default:
        //  this.geometries.poly.visible = this.geometries.poly.line.visible = false;
          this.geometries.tetra.visible = this.geometries.tetra.line.visible = false;
          this.geometries.ico.visible = this.geometries.ico.line.visible = false;
          this.geometries.octahedron.visible = this.geometries.octahedron.line.visible = false;
          this.geometries.cube.visible = this.geometries.cube.line.visible = true;
          this.geometries.cone.visible = this.geometries.cone.line.visible = false;
          this.geometries.cylinder.visible = this.geometries.cylinder.line.visible = false;
          this.activeGeometry = "cube";
          break;
      }
    }
  
    spin(isAnimating, axis) {
      var speed = parameters.speed;
      if (typeof axis !== "string") return;
  
      if (isAnimating) {
        this.geometries[this.activeGeometry].rotation[axis] += speed;
        this.geometries[this.activeGeometry].line.rotation[axis] += speed;
      }
    }
  }
  
  // Inicializacia hlavnej triedy s vizualizaciou - drzi si
  // vsetky geometrie v sebe a implementuje metody
  var viz = new Viz();
  
  var animate = function() {
    requestAnimationFrame(animate);
    viz.controls.update();
  
    viz.renderer.render(viz.scene, viz.camera);
  
    viz.spin(parameters.ani1, "x");
    viz.spin(parameters.ani2, "y");
    viz.spin(parameters.ani3, "z");
  };
  
  animate();