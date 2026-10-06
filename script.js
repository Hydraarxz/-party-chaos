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
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.04);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.8, 8.5);
    camera.position.set(0, 1.8, 9);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Beleuchtung aufbauen
    // Beleuchtung
    setupLighting();

    // 1. Detaillierter Parkett-/Dielenboden
    createRealisticFloor();
    // 1. Detaillierter Holzboden unten
    createDetailedFloor();

    // 2. Kiste mit Holzplanken, Metallecken & Schrauben
    // 2. Detaillierte Kiste mit Planken & Metallbeschlägen
    createDetailedCrate();

    // 3. Sichtbares Regenfenster an deiner markierten Stelle
    // 3. Fenster an der Position aus deiner Skizze
    createWindowAndRain();

    // Maus-Bewegung für Sanften Parallax-Effekt
    // Maus-Parallax
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
@@ -42,170 +44,201 @@
}

function setupLighting() {
    // Grundhelligkeit im Raum
    const ambientLight = new THREE.AmbientLight(0x404060, 1.8);
    // Grundlicht
    const ambientLight = new THREE.AmbientLight(0x2a2a40, 0.9);
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

/* 1. REALISTISCHER HOLZBODEN */
function createRealisticFloor() {
/* 1. DETAILLIERTER HOLZBODEN (Mit Planken-Rillen) */
function createDetailedFloor() {
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
    // Hauptboden-Fläche
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x2b1a0e,
        roughness: 0.35,
        metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
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

    scene.add(floorGroup);
}

/* 2. HOCHDETAILLIERTE HOLZKISTE (Planken, Schrauben, Beschläge) */
/* 2. DETAILLIERTE HOLZKISTE MIT PLANKEN & METALLBESCHLÄGEN */
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
    const boxSize = 2.2;
    
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

    // Metall-Eckschützer an allen 8 Ecken
    const cornerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                // Eckbeschlag
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                corner.position.set(x * (boxSize / 2), y * (boxSize / 2), z * (boxSize / 2));
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

/* 3. KLAR SICHTBARES REGEN-FENSTER */
/* 3. FENSTER AN DER EXAKTEN MAKER-POSITION (Oben Rechts) */
function createWindowAndRain() {
    const windowGroup = new THREE.Group();

    // Helles Glas / Hintergrund-Leuchten
    const glassGeo = new THREE.PlaneGeometry(4.2, 2.8);
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0x1a2840,
    // Fensterrahmen (Position angepasst an deine Zeichnung "Fenster")
    const frameGeo = new THREE.BoxGeometry(4.5, 3.2, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x121218, roughness: 0.8 });
    const windowFrame = new THREE.Mesh(frameGeo, frameMat);
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

    // Regeneffekt hinter dem Fenster
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = 2.5 + (Math.random() - 0.5) * 6; // Vor/Um das Fenster konzentrieren
        rainPos[i + 1] = Math.random() * 5 + 1;
        rainPos[i + 2] = -5.5 + (Math.random() - 0.5) * 1.5;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x77aaff,
        size: 0.04,
        transparent: true,
        opacity: 0.85
        opacity: 0.7
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    windowGroup.add(glass);

    // Fensterrahmen (Holz/Metall)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x15151e, roughness: 0.5 });
    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Sanftes, leichtes Atmen/Schweben der Kiste
    if (partyBoxGroup) {
        partyBoxGroup.position.y = -0.1 + Math.sin(time * 1.2) * 0.05;
        partyBoxGroup.rotation.y = -0.65 + Math.sin(time * 0.6) * 0.03;
    }

    // Animierter Regen
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.15;
            if (positions[i] < 0.5) {
                positions[i] = 5.5; // Wieder oben beim Fenster starten
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Blitze am Fenster
    if (Math.random() > 0.988) {
        lightningLight.intensity = 100 + Math.random() * 120;
    } else {
        lightningLight.intensity *= 0.82;
    }

    // Außenrahmen
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 0.2), frameMat);
    topBar.position.y = 1.4;
    const botBar = topBar.clone();
    botBar.position.y = -1.4;
    // Kamera-Maussteuerung (Parallax)
    camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.2 + 1.8 - camera.position.y) * 0.05;
    camera.lookAt(0, 1, 0);

    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 0.2), frameMat);
    leftBar.position.x = -2.2;
    const rightBar = leftBar.clone();
    rightBar.position.x = 2.2;
    renderer.render(scene, camera);
}

    windowGroup.add(topBar, botBar, leftBar, rightBar);
function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

    // Fenster-Sprossen (Kreuz)
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 0.15), frameMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.15), frameMat);
    windowGroup.add(v
window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
