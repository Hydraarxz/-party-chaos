import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.035);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 8.5);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    setupLighting();
    createProceduralRealisticFloor();
    createGroundedDetailedCrate();
    createLargeAtmosphericWindow();

    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x33334e, 1.8);
    scene.add(ambientLight);

    // Warmes Licht auf den Boden
    const warmSpot = new THREE.SpotLight(0xffb866, 220, 20, Math.PI / 3.5, 0.6);
    warmSpot.position.set(-3.5, 4.5, 4);
    warmSpot.target.position.set(0, -1.2, 0);
    scene.add(warmSpot);
    scene.add(warmSpot.target);

    // Kisten-Licht
    const boxSpot = new THREE.SpotLight(0xffaa55, 160, 15, Math.PI / 4, 0.5);
    boxSpot.position.set(3, 4, 3);
    boxSpot.target.position.set(2, -1.2, 0);
    scene.add(boxSpot);
    scene.add(boxSpot.target);

    lightningLight = new THREE.PointLight(0x88ccff, 0, 30);
    lightningLight.position.set(1.5, 2.5, -4.5);
    scene.add(lightningLight);
}

/* 1. KRAFTVOLLER HOLZBODEN (BILD-UNABHÄNGIG) */
function createProceduralRealisticFloor() {
    const floorGroup = new THREE.Group();

    // Dielen-Struktur & Grundmaterial
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x4a2c17, // Schöne warme Holzfarbe
        roughness: 0.35,  // Glanz im Licht
        metalness: 0.05
    });

    // Versuche Texturen zu laden, falls verfügbar
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./color.jpg', (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 3);
        floorMat.map = tex;
        floorMat.needsUpdate = true;
    });

    textureLoader.load('./normal.jpg', (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 3);
        floorMat.normalMap = tex;
        floorMat.needsUpdate = true;
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floorGroup.add(floor);

    // Dielen-Schattenlinien für echte Holzplanken-Optik
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0f0804 });
    for (let x = -15; x <= 15; x += 0.8) {
        const lineGeo = new THREE.BoxGeometry(0.02, 0.01, 20);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(x, -1.195, 0);
        floorGroup.add(line);
    }

    scene.add(floorGroup);
}

/* 2. HOCHDETAILLIERTE KISTE (FEST AUF DEM BODEN) */
function createGroundedDetailedCrate() {
    partyBoxGroup = new THREE.Group();

    const w = 2.2, h = 2.2, d = 2.2;

    // Schattenfleck direkt unter der Kiste
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(2.0, -1.19, -0.2);
    scene.add(shadow);

    // Kisten-Körper
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x6e401f, roughness: 0.5 });
    const crateBody = new THREE.Mesh(boxGeo, boxMat);
    partyBoxGroup.add(crateBody);

    // Metall-Ecken
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f1f26, roughness: 0.3, metalness: 0.85 });
    const cornerGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                partyBoxGroup.add(corner);
            });
        });
    });

    // Diagonale Holzleiste VORNE
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a2b15, roughness: 0.6 });
    const diagGeo = new THREE.BoxGeometry(w * 1.25, 0.22, 0.08);
    const diag = new THREE.Mesh(diagGeo, frameMat);
    diag.position.z = d / 2 + 0.02;
    diag.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag);

    // Bündig auf dem Boden platziert
    partyBoxGroup.position.set(2.0, -0.1, -0.2);
    partyBoxGroup.rotation.set(0, -0.45, 0);

    scene.add(partyBoxGroup);
}

/* 3. FENSTER MIT REGEN */
function createLargeAtmosphericWindow() {
    const windowGroup = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.7 });
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.6, 0.25), frameMat);
    windowGroup.add(outerFrame);

    const glassGeo = new THREE.PlaneGeometry(4.4, 3.2);
    const glassMat = new THREE.MeshStandardMaterial({
