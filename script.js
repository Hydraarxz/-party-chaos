import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBox, rainParticles, lightningLight;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040407);
    scene.fog = new THREE.FogExp2(0x040407, 0.05);
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.04);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 9);
    camera.position.set(0, 1.8, 9);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Beleuchtung
    setupLighting();

    // 1. Holzboden im Vordergrund
    createWoodFloor();
    // 1. Detaillierter Holzboden unten
    createDetailedFloor();

    // 2. Schräge Kiste im Raum (Jackbox-Style Box)
    createPartyBox();
    // 2. Detaillierte Kiste mit Planken & Metallbeschlägen
    createDetailedCrate();

    // 3. Fensterrahmen & Regeneffekt im Hintergrund
    // 3. Fenster an der Position aus deiner Skizze
    createWindowAndRain();

    // Maus-Bewegung für dynamische Perspektive
    // Maus-Parallax
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
@@ -42,95 +44,152 @@
}

function setupLighting() {
    // Sanftes Raumlicht
    const ambientLight = new THREE.AmbientLight(0x222235, 1.2);
    // Grundlicht
    const ambientLight = new THREE.AmbientLight(0x2a2a40, 0.9);
    scene.add(ambientLight);

    // Warmes Licht von oben auf den Holzboden / Kiste
    const warmLight = new THREE.SpotLight(0xffa559, 120, 20, Math.PI / 4, 0.8);
    warmLight.position.set(2, 6, 4);
    warmLight.target.position.set(2, 0, 0);
    scene.add(warmLight);
    scene.add(warmLight.target);

    // Kaltes, blaues Gewitterlicht hinter dem Fenster
    lightningLight = new THREE.PointLight(0x5588ff, 0, 30);
    lightningLight.position.set(0, 4, -7);
    // Warmes Spotlight von oben auf die Kiste
    const boxSpotLight = new THREE.SpotLight(0xffa044, 150, 15, Math.PI / 4, 0.5);
    boxSpotLight.position.set(3, 5, 3);
    boxSpotLight.castShadow = true;
    boxSpotLight.shadow.mapSize.width = 1024;
    boxSpotLight.shadow.mapSize.height = 1024;
    scene.add(boxSpotLight);

    // Gewitter-Blitzlicht hinter/im Fenster
    lightningLight = new THREE.PointLight(0x66aaff, 0, 30);
    lightningLight.position.set(2.5, 3, -6);
    scene.add(lightningLight);
}

/* 1. HOLZBODEN */
function createWoodFloor() {
    // Texturierte Holzfarben-Oberfläche
/* 1. DETAILLIERTER HOLZBODEN (Mit Planken-Rillen) */
function createDetailedFloor() {
    const floorGroup = new THREE.Group();

    // Hauptboden-Fläche
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x3a2312, // Dazugehörige dunkle Holzfarbe
        roughness: 0.4,
        metalness: 0.1
        color: 0x2b1a0e,
        roughness: 0.35,
        metalness: 0.1,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    scene.add(floor);
    floor.receiveShadow = true;
    floorGroup.add(floor);

    // Holzplanken-Linien (Fugen zwischen den Dielen)
    const plankMat = new THREE.MeshBasicMaterial({ color: 0x110a05 });
    for (let i = -15; i <= 15; i += 0.8) {
        const lineGeo = new THREE.BoxGeometry(0.02, 0.01, 20);
        const line = new THREE.Mesh(lineGeo, plankMat);
        line.position.set(i, -1.195, 0);
        floorGroup.add(line);
    }

    // Holzplanken-Linien
    const grid = new THREE.GridHelper(30, 30, 0x1f1209, 0x1f1209);
    grid.position.y = -1.19;
    scene.add(grid);
    scene.add(floorGroup);
}

/* 2. SCHRÄGE KISTE IM RAUM */
function createPartyBox() {
    const boxGeo = new THREE.BoxGeometry(2.2, 2.8, 2.2);
    
    // Farbiges Kisten-Design
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xff0055, roughness: 0.3 }), // Rechts
        new THREE.MeshStandardMaterial({ color: 0x00f2ff, roughness: 0.3 }), // Links
        new THREE.MeshStandardMaterial({ color: 0xffe600, roughness: 0.3 }), // Oben
        new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.8 }), // Unten
        new THREE.MeshStandardMaterial({ color: 0x181824, roughness: 0.2 }), // Vorne
        new THREE.MeshStandardMaterial({ color: 0x181824, roughness: 0.2 })  // Hinten
    ];

    partyBox = new THREE.Mesh(boxGeo, materials);
/* 2. DETAILLIERTE HOLZKISTE MIT PLANKEN & METALLBESCHLÄGEN */
function createDetailedCrate() {
    partyBoxGroup = new THREE.Group();

    const boxSize = 2.2;

    // Rechts im Raum schräg platziert
    partyBox.position.set(2.8, 0.4, -0.5);
    partyBox.rotation.set(0.3, -0.6, 0.15); // Schräge Drehung
    // Haupt-Holzkörper der Kiste
    const crateBodyGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const crateBodyMat = new THREE.MeshStandardMaterial({
        color: 0x5a3618,
        roughness: 0.6,
        metalness: 0.05
    });
    const mainBox = new THREE.Mesh(crateBodyGeo, crateBodyMat);
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    partyBoxGroup.add(mainBox);

    // Holzplanken-Rahmen außen herum (Cross-Bracing)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3d230e, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.3, metalness: 0.8 });

    // Zier-Planken an den 4 Längsseiten hinzufügen
    const plankThick = 0.08;
    const plankWidth = 0.25;

    // Horizontale Rahmenteile oben und unten
    [-1, 1].forEach(yDir => {
        const hBarGeo = new THREE.BoxGeometry(boxSize + 0.02, plankWidth, boxSize + 0.02);
        const hBar = new THREE.Mesh(hBarGeo, frameMat);
        hBar.position.y = yDir * (boxSize / 2 - plankWidth / 2);
        partyBoxGroup.add(hBar);
    });

    scene.add(partyBox);
    // Metall-Eckschützer an allen 8 Ecken
    const cornerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * (boxSize / 2), y * (boxSize / 2), z * (boxSize / 2));
                partyBoxGroup.add(corner);
            });
        });
    });

    // Diagonale Holzplanke auf der Vorderseite
    const diagGeo = new THREE.BoxGeometry(boxSize * 1.2, plankWidth, plankThick);
    const diagPlank = new THREE.Mesh(diagGeo, frameMat);
    diagPlank.position.z = boxSize / 2 + 0.02;
    diagPlank.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diagPlank);

    // Kiste schräg im Raum platzieren (entsprechend deiner "Kiste"-Markierung)
    partyBoxGroup.position.set(2.4, -0.1, -0.2);
    partyBoxGroup.rotation.set(0.25, -0.65, 0.12);

    scene.add(partyBoxGroup);
}

/* 3. FENSTER & REGEN HINTEN */
/* 3. FENSTER AN DER EXAKTEN MAKER-POSITION (Oben Rechts) */
function createWindowAndRain() {
    // Fensterrahmen im Hintergrund
    const frameGeo = new THREE.BoxGeometry(10, 6, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.9 });
    
    const windowGroup = new THREE.Group();

    // Fensterrahmen (Position angepasst an deine Zeichnung "Fenster")
    const frameGeo = new THREE.BoxGeometry(4.5, 3.2, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x121218, roughness: 0.8 });
    const windowFrame = new THREE.Mesh(frameGeo, frameMat);
    windowFrame.position.set(0, 3, -6);
    scene.add(windowFrame);
    windowGroup.add(windowFrame);

    // Fenster-Sprossen (Kreuz in der Mitte)
    const barMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.8 });
    const vertBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.22), barMat);
    const horizBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.22), barMat);
    windowGroup.add(vertBar);
    windowGroup.add(horizBar);

    // Position des Fensters: Droben rechts im Hintergrund
    windowGroup.position.set(2.5, 2.8, -5);
    scene.add(windowGroup);

    // Regen-Partikel hinter dem Fenster
    const rainCount = 800;
    // Regeneffekt hinter dem Fenster
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = (Math.random() - 0.5) * 16;
        rainPos[i + 1] = Math.random() * 8 + 1;
        rainPos[i + 2] = -6.5 + (Math.random() - 0.5) * 2;
        rainPos[i] = 2.5 + (Math.random() - 0.5) * 6; // Vor/Um das Fenster konzentrieren
        rainPos[i + 1] = Math.random() * 5 + 1;
        rainPos[i + 2] = -5.5 + (Math.random() - 0.5) * 1.5;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88bbff,
        size: 0.05,
        color: 0x77aaff,
        size: 0.04,
        transparent: true,
        opacity: 0.6
        opacity: 0.7
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
@@ -142,44 +201,44 @@

    const time = performance.now() * 0.001;

    // Kiste schwebt/atmet ganz leicht schräg im Raum
    if (partyBox) {
        partyBox.position.y = 0.4 + Math.sin(time * 1.5) * 0.08;
        partyBox.rotation.y = -0.6 + Math.sin(time * 0.8) * 0.05;
    // Sanftes, leichtes Atmen/Schweben der Kiste
    if (partyBoxGroup) {
        partyBoxGroup.position.y = -0.1 + Math.sin(time * 1.2) * 0.05;
        partyBoxGroup.rotation.y = -0.65 + Math.sin(time * 0.6) * 0.03;
    }

    // Regen fällt herunter
    // Animierter Regen
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.18; // Fallgeschwindigkeit
            if (positions[i] < 0) {
                positions[i] = 8; // Von oben neu starten
            positions[i] -= 0.15;
            if (positions[i] < 0.5) {
                positions[i] = 5.5; // Wieder oben beim Fenster starten
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Zufälliges Gewitter-Flackern am Fenster
    if (Math.random() > 0.985) {
        lightningLight.intensity = 80 + Math.random() * 100;
    // Blitze am Fenster
    if (Math.random() > 0.988) {
        lightningLight.intensity = 100 + Math.random() * 120;
    } else {
        lightningLight.intensity *= 0.85; // Schnelles Verblassen
        lightningLight.intensity *= 0.82;
    }

    // Parallax-Kamerausrichtung bei Mausbewegung
    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.3 + 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 1.5, -2);
    // Kamera-Maussteuerung (Parallax)
    camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.2 + 1.8 - camera.position.y) * 0.05;
    camera.lookAt(0, 1, 0);

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
