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
  speed: 0.1
};
class Viz {
  constructor() {
    this.initCube = this.initCube.bind(this);
    this.initCone = this.initCone.bind(this);
    this.initCylinder = this.initCylinder.bind(this);
    this.initOctahedron = this.initOctahedron.bind(this);
    this.initIco = this.initIco.bind(this);
    this.initGUI = this.initGUI.bind(this);
    this.setActive = this.setActive.bind(this);

    // Zakladne jadro programu, ktore nastavi prostredie
    this.camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    // oddialenie kamery (aby bolo vidno objekty pred nou)
    this.camera.position.z = 15;
    this.camera.position.y = 1.5;
    this.camera.rotation.x = 0;
    // this.camera.updateProjectionMatrix()
    this.camera.up = new THREE.Vector3(0, 0, 0);
    console.log(this.camera);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x505050);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.rotateSpeed = -0.25;

    document.body.appendChild(WEBVR.createButton(this.camera, this.renderer));
    // this.renderer.vr.enabled = false;

    var room;
    room = new THREE.LineSegments(
      new THREE.BoxLineGeometry(40, 40, 40, 10, 10, 10),
      new THREE.LineBasicMaterial({ color: 0x808080 })
    );
    room.position.y = 3;
    this.scene.add(room);

    // Geometrie (na zaciatku neexistuju, ale implementujeme metody, ktore ich nastavia)
    this.geometries = {
      cube: null,
      cone: null,
      cylinder: null,
      octahedron: null,
      ico: null
    };

    // Kym nemame inicializovane ziadne geometrie, ziadna teda nemoze byt aktivna
    this.activeGeometry = null;

    // inicializacia vsetkych geometrii
    this.initCube();
    this.initCone();
    this.initCylinder();
    this.initOctahedron();
    this.initIco();

    // Na zaciatku bude aktivna kocka
    this.setActive("Kocka");

    // Inicializacia dat.gui
    this.initGUI();
  }

  initGUI() {
    this.gui = new dat.GUI();
    this.typ = this.gui
      .add(parameters, "tvar", [
        "Kocka",
        "Ihlan",
        "Valec",
        "Octahedron",
        "Icoshedron"
      ])
      .name("Objekt");
    // Zmena parametru Objekt ("Kocka", "Ihlan" alebo "Valec") bude rovno
    // zavolana ako atribut `geometryType` metodou this.setActive(geometryType)
    this.typ.onChange(this.setActive);

    this.color = this.gui.addColor(parameters, "color").name("Farba");
    this.color.onChange(color => {
      this.geometries[this.activeGeometry].material.color.setHex(
        color.replace("#", "0x")
      );
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
      console.log(pohyb);
    });
    ydimen.onChange(pohyb => {
      this.geometries[this.activeGeometry].scale.y = pohyb;
    });
    zdimen.onChange(pohyb => {
      this.geometries[this.activeGeometry].scale.z = pohyb;
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
    });
    ypos.onChange(pozicia => {
      this.geometries[this.activeGeometry].position.y = pozicia;
    });
    zpos.onChange(pozicia => {
      this.geometries[this.activeGeometry].position.z = pozicia;
    });

    this.speed = this.gui
      .add(parameters, "speed")
      .min(0)
      .max(5)
      .step(0.1)
      .name("Rychlost animacie");

    var restartOptions = {
      restart: () => {
        this.camera.position.z = 15;

        // nastav vsetkym geometriam zakladne nastavenia (zresetuj)
        Object.entries(this.geometries).forEach(function(geom) {
          geom.scale.x = 1;
          geom.scale.z = 1;
          geom.scale.y = 1;
          geom.position.x = 0;
          geom.position.y = 0;
          geom.position.z = 0;
        });
      }
    };

    this.gui.add(restartOptions, "restart");

    this.gui.open();
  }

  initCube() {
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var material = new THREE.MeshBasicMaterial({
      color: "#ff0000",
      wireframe: true
    });

    this.geometries.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cube);
  }

  initCone() {
    var geometry = new THREE.ConeGeometry(2.5, 10, 16);
    var material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true
    });

    this.geometries.cone = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cone);
  }

  initCylinder() {
    var geometry = new THREE.CylinderGeometry(2.5, 2.5, 10, 16);
    var material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true
    });

    this.geometries.cylinder = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cylinder);
  }
  initOctahedron() {
    var geometry = new THREE.OctahedronGeometry(3, 0);
    var material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true
    });

    this.geometries.octahedron = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.octahedron);
  }
  initIco() {
    var geometry = new THREE.IcosahedronGeometry(3, 1);
    var material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true
    });

    this.geometries.ico = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.ico);
  }

  setActive(geometryType) {
    switch (geometryType) {
      case "Ihlan":
        this.geometries.ico.visible = false;
        this.geometries.octahedron.visible = false;
        this.geometries.cube.visible = false;
        this.geometries.cone.visible = true;
        this.geometries.cylinder.visible = false;
        this.activeGeometry = "cone";
        break;
      case "Valec":
        this.geometries.ico.visible = false;
        this.geometries.octahedron.visible = false;
        this.geometries.cube.visible = false;
        this.geometries.cone.visible = false;
        this.geometries.cylinder.visible = true;
        this.activeGeometry = "cylinder";
        break;
      case "Octahedron":
        this.geometries.ico.visible = false;
        this.geometries.octahedron.visible = true;
        this.geometries.cube.visible = false;
        this.geometries.cone.visible = false;
        this.geometries.cylinder.visible = false;
        this.activeGeometry = "octahedron";
        break;
      case "Icoshedron":
        this.geometries.ico.visible = true;
        this.geometries.octahedron.visible = false;
        this.geometries.cube.visible = false;
        this.geometries.cone.visible = false;
        this.geometries.cylinder.visible = false;
        this.activeGeometry = "ico";
        break;
      default:
        this.geometries.ico.visible = false;
        this.geometries.octahedron.visible = false;
        this.geometries.cube.visible = true;
        this.geometries.cone.visible = false;
        this.geometries.cylinder.visible = false;
        this.activeGeometry = "cube";
        break;
    }
  }

  // spin = (varname, xaxis, yaxis, zaxis) => {
  //   var speed = 0.01;

  //   if (varname == true) {
  //     if (xaxis == true) {
  //       this.geometries[this.activeGeometry].rotation.x += speed;
  //     } else if (yaxis == true) {
  //       this.geometries[this.activeGeometry].rotation.y += speed;
  //     } else this.geometries[this.activeGeometry].rotation.z += speed;
  //   }
  // }
}

// Inicializacia hlavnej triedy s vizualizaciou - drzi si
// vsetky geometrie v sebe a implementuje metody
var viz = new Viz();

var animate = function() {
  requestAnimationFrame(animate);
  viz.controls.update();
  viz.renderer.render(viz.scene, viz.camera);
};

animate();
