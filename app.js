/* global math */

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
  a: 0.01,
  b: 0.01,
  c: 0.01,
  d: 0.01,
  zFuncText: "x^2 - y^2",
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  zMin: -10,
  zMax: 10,
  segments: 20,
};

// custom global variables
var gui,
  gui_zText,
  gui_xMin,
  gui_xMax,
  gui_yMin,
  gui_yMax,
  gui_a,
  gui_b,
  gui_c,
  gui_d,
  gui_segments;

var zFunc = math.parse(parameters.zFuncText);

// Parametre pre rovnicu
var a = 0.01,
  b = 0.01,
  c = 0.01,
  d = 0.01;

var meshFunction;
var segments = 20,
  xMin = -10,
  xMax = 10,
  xRange = xMax - xMin,
  yMin = -10,
  yMax = 10,
  yRange = yMax - yMin,
  zMin = -10,
  zMax = 10,
  zRange = zMax - zMin;

var graphGeometry;
var gridMaterial, wireMaterial, vertexColorMaterial;
var graphMesh;

var normMaterial = new THREE.MeshNormalMaterial();
var shadeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

// "wireframe texture"
var wireTexture = new THREE.TextureLoader().load("/img/square.png");
wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
wireTexture.repeat.set(40, 40);
wireMaterial = new THREE.MeshBasicMaterial({
  map: wireTexture,
  vertexColors: THREE.VertexColors,
  side: THREE.DoubleSide,
});

var vertexColorMaterial = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
});

class Viz {
  constructor() {
    // Inicializacia v konštruktore
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
    this.createGraph = this.createGraph.bind(this);
    this.preset01 = this.preset01.bind(this);

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
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableDamping = true;
    this.controls.rotateSpeed = -0.25;

    document.body.appendChild(WEBVR.createButton(this.camera, this.renderer));

    const createAxis = (type, color, length) => {
      console.log(typeof color !== "string");
      if (
        typeof type === "undefined" ||
        typeof type !== "string" ||
        !["x", "y", "z"].includes(type)
      ) {
        console.error("Nesprávny `type` atribút v createAxis funkcii!");
        return;
      }

      if (
        typeof color === "undefined" ||
        (typeof color !== "string" && typeof color !== "number")
      ) {
        console.error("Farba je v nespravnom formate!");
        return;
      }

      if (typeof length === "undefined" || typeof length !== "number") {
        console.error("Dlzka je v nespravnom formate!");
        return;
      }

      var geometry = new THREE.Geometry();
      if (type === "x") {
        geometry.vertices.push(
          new THREE.Vector3(-length, 0, 0),
          new THREE.Vector3(length, 0, 0)
        );
      } else if (type === "y") {
        geometry.vertices.push(
          new THREE.Vector3(0, -length, 0),
          new THREE.Vector3(0, length, 0)
        );
      } else {
        geometry.vertices.push(
          new THREE.Vector3(0, 0, -length),
          new THREE.Vector3(0, 0, length)
        );
      }

      var material = new THREE.LineBasicMaterial({
        color,
        linewidth: 10,
      });

      var line = new THREE.Line(geometry, material);
      this.scene.add(line);
    };

    // this.scene.add(new THREE.AxesHelper(20, 20, 20));

    createAxis("x", "red", 10);
    createAxis("y", "blue", 10);
    createAxis("z", "green", 10);

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

    parameters.graphFunc = this.createGraph;

    parameters.preset1 = this.preset01;

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
        "Tetrahedron",
        "Octahedron",
        "Icoshedron",
      ])
      .name("Objekt");
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
          console.log(geom);
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

    // Parametricke rovnice
    gui_zText = this.gui.add(parameters, "zFuncText").name("f(x,y) = ");
    gui_xMin = this.gui.add(parameters, "xMin").name("x Minimum = ");
    gui_xMax = this.gui.add(parameters, "xMax").name("x Maximum = ");
    gui_yMin = this.gui.add(parameters, "yMin").name("y Minimum = ");
    gui_yMax = this.gui.add(parameters, "yMax").name("y Maximum = ");
    gui_segments = this.gui.add(parameters, "segments").name("Segmenty = ");

    // GUI -- parameters
    var gui_parameters = this.gui.addFolder("Parametre rovnice");
    a = b = c = d = 0.01;

    gui_a = gui_parameters
      .add(parameters, "a")
      .min(-5)
      .max(5)
      .step(0.01)
      .name("a = ");
    gui_a.onChange(() => {
      this.createGraph();
    });
    gui_b = gui_parameters
      .add(parameters, "b")
      .min(-5)
      .max(5)
      .step(0.01)
      .name("b = ");
    gui_b.onChange(() => {
      this.createGraph();
    });
    gui_c = gui_parameters
      .add(parameters, "c")
      .min(-5)
      .max(5)
      .step(0.01)
      .name("c = ");
    gui_c.onChange(() => {
      this.createGraph();
    });
    gui_d = gui_parameters
      .add(parameters, "d")
      .min(-5)
      .max(5)
      .step(0.01)
      .name("d = ");
    gui_d.onChange(() => {
      this.createGraph();
    });
    gui_a.setValue(1);
    gui_b.setValue(1);
    gui_c.setValue(1);
    gui_d.setValue(1);

    // Vzorové rovnice
    var gui_preset = this.gui.addFolder("Vzorove rovnice");
    gui_preset.add(parameters, "preset1").name("Sinusove kruhy");

    this.gui.add(parameters, "graphFunc").name("Vykreslit funkciu");

    this.preset01();

    this.gui.open();
  }

  initCube() {
    var geometry = new THREE.BoxBufferGeometry(5, 5, 5);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cube);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.cube.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.cube.line);
  }

  initCone() {
    var geometry = new THREE.ConeBufferGeometry(2.5, 10, 16);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.cone = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cone);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.cone.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.cone.line);
  }

  initCylinder() {
    var geometry = new THREE.CylinderBufferGeometry(2.5, 2.5, 10, 16);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.cylinder = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.cylinder);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.cylinder.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.cylinder.line);
  }
  initOctahedron() {
    var geometry = new THREE.OctahedronBufferGeometry(3, 0);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.octahedron = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.octahedron);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.octahedron.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.octahedron.line);
  }
  initIco() {
    var geometry = new THREE.IcosahedronBufferGeometry(6, 0);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.ico = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.ico);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.ico.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.ico.line);
  }

  initTetra() {
    var geometry = new THREE.TetrahedronBufferGeometry(6, 0);
    var material = new THREE.MeshPhongMaterial({
      color: "#f78b11",
      wireframe: true,
      transparent: true,
    });

    this.geometries.tetra = new THREE.Mesh(geometry, material);
    this.scene.add(this.geometries.tetra);

    var edges = new THREE.EdgesGeometry(geometry);
    this.geometries.tetra.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.geometries.tetra.line);
  }

  /* initPoly() {
      var verticesOfCube = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1];

      var indicesOfFaces = [2, 1, 0, 0, 3, 2, 0, 4, 7, 7, 3, 0, 0, 1, 5, 5, 4, 0, 1, 2, 6, 6, 5, 1, 2, 3, 7, 7, 6, 2, 4, 5, 6, 6, 7, 4];

      var geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, 6, 2);
      var material = new THREE.MeshPhongMaterial({
        color: "#f78b11",
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

  createGraph() {
    xRange = xMax - xMin;
    yRange = yMax - yMin;
    zFunc = math.parse(parameters.zFuncText);

    var compiledFunc = zFunc.compile();

    function meshFunction(x, y, target) {
      x = xRange * x + xMin;
      y = yRange * y + yMin;
      var z = compiledFunc.eval({
        x,
        y,
        a: parameters.a,
        b: parameters.b,
        c: parameters.c,
        d: parameters.d,
      });

      if (isNaN(z)) return target.set(0, 0, 0);
      else return target.set(x, z, y);
    }

    // true => sensible image tile repeat...
    graphGeometry = new THREE.ParametricGeometry(
      meshFunction,
      parameters.segments,
      parameters.segments,
      true
    );

    // calculate vertex colors based on Z values
    graphGeometry.computeBoundingBox();
    zMin = graphGeometry.boundingBox.min.z;
    zMax = graphGeometry.boundingBox.max.z;
    zRange = zMax - zMin;
    var color, point, face, numberOfSides, vertexIndex;
    // faces are indexed using characters
    var faceIndices = ["a", "b", "c", "d"];
    // first, assign colors to vertices as desired
    for (var i = 0; i < graphGeometry.vertices.length; i++) {
      point = graphGeometry.vertices[i];
      color = new THREE.Color(0x0000ff);
      color.setHSL((0.7 * (zMax - point.z)) / zRange, 1, 0.5);
      graphGeometry.colors[i] = color; // use this array for convenience
    }
    // copy the colors as necessary to the face's vertexColors array.
    for (var i = 0; i < graphGeometry.faces.length; i++) {
      face = graphGeometry.faces[i];
      numberOfSides = face instanceof THREE.Face3 ? 3 : 4;
      for (var j = 0; j < numberOfSides; j++) {
        vertexIndex = face[faceIndices[j]];
        face.vertexColors[j] = graphGeometry.colors[vertexIndex];
      }
    }

    // end vertex colors

    // material choices: vertexColorMaterial, wireMaterial , normMaterial , shadeMaterial

    if (graphMesh) {
      this.scene.remove(graphMesh);
      // renderer.deallocateObject( graphMesh );
    }

    wireMaterial.map.repeat.set(parameters.segments, parameters.segments);

    graphMesh = new THREE.Mesh(graphGeometry, wireMaterial);
    graphMesh.doubleSided = true;
    this.scene.add(graphMesh);
  }

  preset01() {
    gui_zText.setValue("sin(sqrt(a*x^2  + b*y^2))");
    gui_xMin.setValue(-10);
    gui_xMax.setValue(10);
    gui_yMin.setValue(-10);
    gui_yMax.setValue(10);
    gui_a.setValue(1);
    gui_b.setValue(1);
    gui_segments.setValue(40);
    this.createGraph();
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
