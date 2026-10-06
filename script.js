import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene;
let camera;
let renderer;

let speakers = [];
let lights = [];

init();
animate();

function init() {
    // 1. Szene & Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030308);
    scene.fog = new THREE.FogExp2(0x080610, 0.035);

    // 2. Kamera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(0, 3.2, 13);
    camera.lookAt(0, 2.5, 0);

    // 3. Renderer (Nimmt die Canvas aus der index.html!)
    const canvas = document.getElementById("stage3d");

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 4. Lichter & Objekte
    const ambientLight = new THREE.AmbientLight(0x151525, 1.5);
    scene.add(ambientLight);

    createFloor();
    createStage();
    createTruss();

    createSpeaker(-4.7, 2.1, 0);
    createSpeaker(4.7, 2.1, 0);

    createSpotlight(-4, 6, 1, 0x218cff);
    createSpotlight(0, 6.5, 1, 0xb840ff);
    createSpotlight(4, 6, 1, 0xffb51b);

    window.addEventListener("resize", resize);
}

/* =========================================
   BODEN, BÜHNE, TRUSS & RESTRICHER CODE
   (Bleibt genau so wie in deinem Skript!)
========================================= */
function createFloor() {
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x15151a,
        metalness: 0.65,
        roughness: 0.38
    });
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createStage() {
    const material = new THREE.MeshStandardMaterial({
        color: 0x202027,
        metalness: 0.5,
        roughness: 0.45
    });
    const geometry = new THREE.BoxGeometry(13, 0.35, 5);
    const stage = new THREE.Mesh(geometry, material);
    stage.position.set(0, 0.35, 0);
    stage.receiveShadow = true;
    stage.castShadow = true;
    scene.add(stage);
}

function createTruss() {
    const material = new THREE.MeshStandardMaterial({
        color: 0x17171a,
        metalness: 0.9,
        roughness: 0.25
    });

    const top = new THREE.Mesh(new THREE.BoxGeometry(12, 0.28, 0.28), material);
    top.position.set(0, 7, 0);
    top.castShadow = true;
    scene.add(top);

    const sideGeometry = new THREE.BoxGeometry(0.28, 7, 0.28);
    const left = new THREE.Mesh(sideGeometry, material);
    left.position.set(-6, 3.5, 0);
    left.castShadow = true;
    scene.add(left);

    const right = new THREE.Mesh(sideGeometry, material);
    right.position.set(6, 3.5, 0);
    right.castShadow = true;
    scene.add(right);

    for (let x = -5; x <= 5; x += 2) {
        const diagonal = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.08), material);
        diagonal.position.set(x, 7, 0);
        diagonal.rotation.z = Math.PI / 8;
        scene.add(diagonal);
    }
}

function createSpeaker(x, y, z) {
    const cabinetMaterial = new THREE.MeshStandardMaterial({
        color: 0x08090b,
        metalness: 0.7,
        roughness: 0.3
    });

    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2, 3.8, 1.35), cabinetMaterial);
    cabinet.position.set(x, y, z);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    scene.add(cabinet);

    const bigDriver = createDriver(0.65, 0.65);
    bigDriver.position.set(x, y - 0.65, z - 0.72);
    scene.add(bigDriver);

    const smallDriver = createDriver(0.38, 0.38);
    smallDriver.position.set(x, y + 0.8, z - 0.72);
    scene.add(smallDriver);

    speakers.push(cabinet);
}

function createDriver(radiusX, radiusY) {
    const material = new THREE.MeshStandardMaterial({
        color: 0x090909,
        metalness: 0.3,
        roughness: 0.55
    });
    const geometry = new THREE.CylinderGeometry(radiusX, radiusY, 0.16, 48);
    const driver = new THREE.Mesh(geometry, material);
    driver.rotation.x = Math.PI / 2;
    driver.castShadow = true;
    return driver;
}

function createSpotlight(x, y, z, color) {
    const housingMaterial = new THREE.MeshStandardMaterial({
        color: 0x121214,
        metalness: 0.8,
        roughness: 0.3
    });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 32), housingMaterial);
    housing.position.set(x, y, z);
    housing.rotation.z = Math.PI / 2;
    housing.castShadow = true;
    scene.add(housing);

    const light = new THREE.SpotLight(color, 90, 20, Math.PI / 8, 0.55, 1);
    light.position.set(x, y, z);
    light.target.position.set(0, 1, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);
    scene.add(light.target);

    lights.push(light);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.0003;
    camera.position.x = Math.sin(time) * 0.08;
    camera.position.y = 3.2 + Math.sin(time * 1.5) * 0.04;
    camera.lookAt(0, 2.5, 0);

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = function() {
    alert("🎮 Spiel erstellen kommt bald!");
};

window.joinGame = function() {
    alert("🚪 Spiel beitreten kommt bald!");
};
v    // 1. Szene & Düsterer Nebel (Blutrot / Dunkelviolett)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020104); // Sehr dunkles Violett-Schwarz
    scene.fog = new THREE.FogExp2(0x12021a, 0.05); // Dichter, spukiger Nebel

    // 2. Kamera (etwas näher und tiefer für mehr Dramatik)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2.5, 11);
    camera.lookAt(0, 2, 0);

    // 3. Canvas aus HTML
    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Düsteres Umgebungslicht
    const ambientLight = new THREE.AmbientLight(0x2a083b, 0.8); // Dunkles Purple
    scene.add(ambientLight);

    createFloor();
    createStage();
    createTruss();

    createSpeaker(-4.7, 2.1, 0);
    createSpeaker(4.7, 2.1, 0);

    // Unheimliche Scheinwerfer-Farben (Giftgrün, Blutrot, Cyan)
    createSpotlight(-4, 6, 1, 0x00ff66); // Giftgrün
    createSpotlight(0, 6.5, 1, 0xff0044);  // Blutrot
    createSpotlight(4, 6, 1, 0x00ccff);  // Cyan
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.002;
    
    // Zitternde Kamera (Horror-Kamera-Gewackel)
    camera.position.x = Math.sin(time * 0.5) * 0.15;
    camera.position.y = 2.5 + Math.cos(time * 0.8) * 0.08;
    camera.lookAt(0, 2, 0);

    // Leichtes Flackern der Lichter wie bei alten Discolichtern
    if (lights.length > 0) {
        lights[0].intensity = 70 + Math.sin(time * 10) * 20;
        lights[1].intensity = 80 + Math.cos(time * 15) * 25;
    }

    renderer.render(scene, camera);
}
