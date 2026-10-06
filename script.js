import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.035);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.8, 8.5);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Beleuchtung aufbauen
    setupLighting();

    // 1. Detaillierter Parkett-/Dielenboden
    createRealisticFloor();

    // 2. Kiste mit Holzplanken, Metallecken & Schrauben
    createDetailedCrate();

    // 3. Sichtbares Regenfenster an deiner markierten Stelle
    createWindowAndRain();

    // Maus-Bewegung für Sanften Parallax-Effekt
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    // Grundhelligkeit im Raum
    const ambientLight = new THREE.AmbientLight(0x404060, 1.8);
    scene.add(ambientLight);

    // Starkes Spotlight direkt auf die Kiste (damit alle Planken & Schrauben glänzen)
    const boxSpot = new THREE.SpotLight(0xffb066, 250, 20, Math.PI / 3, 0.4);
    boxSpot.position.set(4, 5, 5);
    boxSpot.target.position.set(2, 0, 0);
    scene.add(boxSpot);
    scene.add(boxSpot.target);

    // Kaltes Gegenlicht für Kontrast
    const rimLight = new THREE.DirectionalLight(0x3366ff, 2.5);
    rimLight.position.set(-5, 4, -2);
    scene.add(rimLight);

    // Gewitter-Blitzlicht hinter dem Fenster
    lightningLight = new THREE.PointLight(0x88ccff, 0, 40);
    lightningLight.position.set(2.2, 2.8, -5);
    scene.add(lightningLight);
}

/* 1. REALISTISCHER HOLZBODEN */
function createRealisticFloor() {
    const floorGroup = new THREE.Group();

    // Dunkle Unterlage
    const baseGeo = new THREE.PlaneGeometry(30, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f0905, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = -1.5;
    floorGroup.add(base);

    // Einzelne Holzplanken mit leicht variierenden Farbtönen
    const plankWidth = 0.6;
    const plankLength = 16;
    const colors = [0x5c3a21, 0x4a2e19, 0x6e4627, 0x3d2412];

    for (let x = -10; x <= 10; x += plankWidth + 0.02) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const plankGeo = new THREE.BoxGeometry(plankWidth, 0.04, plankLength);
        const plankMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.35,
            metalness: 0.05
        });
        const plank = new THREE.Mesh(plankGeo, plankMat);
        plank.position.set(x, -1.48, 0);
        floorGroup.add(plank);
    }

    scene.add(floorGroup);
}

/* 2. HOCHDETAILLIERTE HOLZKISTE (Planken, Schrauben, Beschläge) */
function createDetailedCrate() {
    partyBoxGroup = new THREE.Group();

    const w = 2.2, h = 2.2, d = 2.2;

    // Innenkern der Kiste (Dunkel)
    const coreGeo = new THREE.BoxGeometry(w - 0.05, h - 0.05, d - 0.05);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x22130c, roughness: 0.8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    partyBoxGroup.add(core);

    // Holzplanken-Material
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5229, roughness: 0.5 });
    const woodMatDark = new THREE.MeshStandardMaterial({ color: 0x63391b, roughness: 0.6 });

    // Vorderseite mit mehreren horizontalen Planken aufbauen
    const numPlanks = 5;
    const pHeight = (h - 0.1) / numPlanks;

    for (let i = 0; i < numPlanks; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        // Front-Planke
        const fPlankGeo = new THREE.BoxGeometry(w - 0.2, pHeight - 0.03, 0.06);
        const fPlank = new THREE.Mesh(fPlankGeo, woodMat);
        fPlank.position.set(0, yPos, d / 2);
        partyBoxGroup.add(fPlank);

        // Rückseiten-Planke
        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);
    }

    // Diagonal-Verstrebung VORNE (X-Form)
    const diagGeo = new THREE.BoxGeometry(w * 1.2, 0.2, 0.08);
    const diag1 = new THREE.Mesh(diagGeo, woodMatDark);
    diag1.position.z = d / 2 + 0.02;
    diag1.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag1);

    const diag2 = new THREE.Mesh(diagGeo, woodMatDark);
    diag2.position.z = d / 2 + 0.02;
    diag2.rotation.z = -Math.PI / 4;
    partyBoxGroup.add(diag2);

    // Metall-Eckschützer & Schrauben
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.2, metalness: 0.85 });
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xd0d0dd, roughness: 0.1, metalness: 0.95 });

    const cornerGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const screwGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                // Eckbeschlag
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                partyBoxGroup.add(corner);

                // Schrauben / Nieten auf den Beschlägen
                const screw = new THREE.Mesh(screwGeo, screwMat);
                screw.position.set(x * (w / 2 + 0.02), y * (h / 2), z * (d / 2 + 0.02));
                screw.rotation.x = Math.PI / 2;
                partyBoxGroup.add(screw);
            });
        });
    });

    // Kisten-Position rechts schräg im Raum
    partyBoxGroup.position.set(2.2, -0.2, 0.2);
    partyBoxGroup.rotation.set(0.2, -0.6, 0.08);

    scene.add(partyBoxGroup);
}

/* 3. KLAR SICHTBARES REGEN-FENSTER */
function createWindowAndRain() {
    const windowGroup = new THREE.Group();

    // Helles Glas / Hintergrund-Leuchten
    const glassGeo = new THREE.PlaneGeometry(4.2, 2.8);
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0x1a2840,
        transparent: true,
        opacity: 0.85
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    windowGroup.add(glass);

    // Fensterrahmen (Holz/Metall)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x15151e, roughness: 0.5 });

    // Außenrahmen
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 0.2), frameMat);
    topBar.position.y = 1.4;
    const botBar = topBar.clone();
    botBar.position.y = -1.4;

    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 0.2), frameMat);
    leftBar.position.x = -2.2;
    const rightBar = leftBar.clone();
    rightBar.position.x = 2.2;

    windowGroup.add(topBar, botBar, leftBar, rightBar);

    // Fenster-Sprossen (Kreuz)
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 0.15), frameMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.15), frameMat);
    windowGroup.add(v
