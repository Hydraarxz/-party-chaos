import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBox, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040407);
    scene.fog = new THREE.FogExp2(0x040407, 0.05);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 9);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Beleuchtung
    setupLighting();

    // 1. Holzboden im Vordergrund
    createWoodFloor();

    // 2. Schräge Kiste im Raum (Jackbox-Style Box)
    createPartyBox();

    // 3. Fensterrahmen & Regeneffekt im Hintergrund
    createWindowAndRain();

    // Maus-Bewegung für dynamische Perspektive
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    // Sanftes Raumlicht
    const ambientLight = new THREE.AmbientLight(0x222235, 1.2);
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
    scene.add(lightningLight);
}

/* 1. HOLZBODEN */
function createWoodFloor() {
    // Texturierte Holzfarben-Oberfläche
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x3a2312, // Dazugehörige dunkle Holzfarbe
        roughness: 0.4,
        metalness: 0.1
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    scene.add(floor);

    // Holzplanken-Linien
    const grid = new THREE.GridHelper(30, 30, 0x1f1209, 0x1f1209);
    grid.position.y = -1.19;
    scene.add(grid);
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
    
    // Rechts im Raum schräg platziert
    partyBox.position.set(2.8, 0.4, -0.5);
    partyBox.rotation.set(0.3, -0.6, 0.15); // Schräge Drehung

    scene.add(partyBox);
}

/* 3. FENSTER & REGEN HINTEN */
function createWindowAndRain() {
    // Fensterrahmen im Hintergrund
    const frameGeo = new THREE.BoxGeometry(10, 6, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.9 });
    
    const windowFrame = new THREE.Mesh(frameGeo, frameMat);
    windowFrame.position.set(0, 3, -6);
    scene.add(windowFrame);

    // Regen-Partikel hinter dem Fenster
    const rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = (Math.random() - 0.5) * 16;
        rainPos[i + 1] = Math.random() * 8 + 1;
        rainPos[i + 2] = -6.5 + (Math.random() - 0.5) * 2;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88bbff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Kiste schwebt/atmet ganz leicht schräg im Raum
    if (partyBox) {
        partyBox.position.y = 0.4 + Math.sin(time * 1.5) * 0.08;
        partyBox.rotation.y = -0.6 + Math.sin(time * 0.8) * 0.05;
    }

    // Regen fällt herunter
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.18; // Fallgeschwindigkeit
            if (positions[i] < 0) {
                positions[i] = 8; // Von oben neu starten
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Zufälliges Gewitter-Flackern am Fenster
    if (Math.random() > 0.985) {
        lightningLight.intensity = 80 + Math.random() * 100;
    } else {
        lightningLight.intensity *= 0.85; // Schnelles Verblassen
    }

    // Parallax-Kamerausrichtung bei Mausbewegung
    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.3 + 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 1.5, -2);

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
