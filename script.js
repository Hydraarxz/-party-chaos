import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================================
// SYSTEM PIPELINE & ENGINE VARIABLES
// ============================================================================
let scene, camera, renderer;
let partyBoxGroup, floorGroup, windowGroup, roomGroup;
let rainLineSystem, glassDropletsSystem, fogParticles;
let ambientLight, windowMoonLight, crateWarmLight, lightningLight;
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
let clock = new THREE.Clock();

const CONFIG = {
    camera: { fov: 42, basePos: new THREE.Vector3(0, 1.45, 8.0), lookAt: new THREE.Vector3(0, 0.25, 0) },
    window: { width: 4.2, height: 3.2, pos: new THREE.Vector3(1.8, 2.2, -4.5) },
    rain: { streakCount: 450, dropCount: 200 }
};

window.addEventListener("DOMContentLoaded", () => {
    initEngine();
    animateEngine();
});

// ============================================================================
// CORE ENGINE SETUP
// ============================================================================
function initEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010204);
    scene.fog = new THREE.FogExp2(0x010204, 0.045);

    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.copy(CONFIG.camera.basePos);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.shadowMap.enabled = true;

    setupLighting();
    buildRoomWalls(); // Verhindert das Überlappen des Waldes!
    buildProceduralFloor();
    buildDetailedCrate();
    buildWindowAndDarkForest();
    buildRainPhysics();

    window.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", onWindowResize);
}

// ============================================================================
// BELEUCHTUNG & ATMOSPHÄRE
// ============================================================================
function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x0a1018, 0.9);
    scene.add(ambientLight);

    // Kaltes Mondlicht durch das Fenster
    windowMoonLight = new THREE.SpotLight(0x3d6494, 150, 16, Math.PI / 3.2, 0.55);
    windowMoonLight.position.set(CONFIG.window.pos.x, CONFIG.window.pos.y + 0.3, CONFIG.window.pos.z + 0.2);
    windowMoonLight.target.position.set(-0.5, -1.0, 1.5);
    windowMoonLight.castShadow = true;
    scene.add(windowMoonLight);
    scene.add(windowMoonLight.target);

    // Sanfter warmer Akzent auf der Kiste
    crateWarmLight = new THREE.SpotLight(0xaa5b28, 40, 10, Math.PI / 4, 0.85);
    crateWarmLight.position.set(3.8, 2.8, 3.2);
    crateWarmLight.target.position.set(1.9, -0.2, -0.2);
    scene.add(crateWarmLight);
    scene.add(crateWarmLight.target);

    // Gewitterblitz
    lightningLight = new THREE.PointLight(0x88ccff, 0, 60);
    lightningLight.position.set(CONFIG.window.pos.x, CONFIG.window.pos.y + 0.5, CONFIG.window.pos.z - 1.5);
    scene.add(lightningLight);
}

// ============================================================================
// RAUMWÄNDE (BLOCKIERT ÜBERLAPPEN DES WALDES)
// ============================================================================
function buildRoomWalls() {
    roomGroup = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.9 });

    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    // Wand Links vom Fenster
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 0.2), wallMat);
    leftWall.position.set(wPos.x - wW / 2 - 5, wPos.y, wPos.z);
    
    // Wand Rechts vom Fenster
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 0.2), wallMat);
    rightWall.position.set(wPos.x + wW / 2 + 5, wPos.y, wPos.z);

    // Wand Oberhalb
    const topWall = new THREE.Mesh(new THREE.BoxGeometry(wW + 10, 5, 0.2), wallMat);
    topWall.position.set(wPos.x, wPos.y + wH / 2 + 2.5, wPos.z);

    // Wand Unterhalb
    const botWall = new THREE.Mesh(new THREE.BoxGeometry(wW + 10, 5, 0.2), wallMat);
    botWall.position.set(wPos.x, wPos.y - wH / 2 - 2.5, wPos.z);

    roomGroup.add(leftWall, rightWall, topWall, botWall);
    scene.add(roomGroup);
}

// ============================================================================
// REALISTISCHER HOLZBODEN
// ============================================================================
function buildProceduralFloor() {
    floorGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a0e07';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = Math.random() > 0.45 ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        const y = Math.random() * 1024;
        const h = Math.random() * 3 + 1;
        ctx.fillRect(0, y, 1024, h);
    }

    ctx.fillStyle = '#020101';
    for (let y = 0; y < 1024; y += 64) {
        ctx.fillRect(0, y, 1024, 5);
    }

    const diffuseTex = new THREE.CanvasTexture(canvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;
    diffuseTex.repeat.set(3, 5);

    const floorMat = new THREE.MeshStandardMaterial({
        map: diffuseTex,
        roughness: 0.35,
        metalness: 0.08
    });

    const floorGeo = new THREE.PlaneGeometry(32, 22);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.2;
    floorMesh.receiveShadow = true;

    floorGroup.add(floorMesh);
    scene.add(floorGroup);
}

// ============================================================================
// PLASTISCHE KISTE
// ============================================================================
function buildDetailedCrate() {
    partyBoxGroup = new THREE.Group();
    const w = 2.2, h = 2.2, d = 2.2;

    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(1.9, -1.192, -0.2);
    scene.add(shadowMesh);

    const coreGeo = new THREE.BoxGeometry(w - 0.06, h - 0.06, d - 0.06);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x100804, roughness: 0.95 });
    partyBoxGroup.add(new THREE.Mesh(coreGeo, coreMat));

    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x482a15, roughness: 0.58 });
    const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x2b180b, roughness: 0.68 });
    const reinforcedMetalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.28, metalness: 0.92 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x505060, roughness: 0.18, metalness: 0.98 });

    const plankCount = 5;
    const pHeight = (h - 0.1) / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        const fPlank = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, pHeight - 0.03, 0.05), woodPlankMat);
        fPlank.position.set(0, yPos, d / 2);
        partyBoxGroup.add(fPlank);

        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);
    }

    const diagGeo = new THREE.BoxGeometry(w * 1.22, 0.16, 0.07);
    const diagFront = new THREE.Mesh(diagGeo, darkFrameMat);
    diagFront.position.z = d / 2 + 0.025;
    diagFront.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diagFront);

    const cornerGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    const rivetGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, reinforcedMetalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                partyBoxGroup.add(corner);

                const rivet = new THREE.Mesh(rivetGeo, boltMat);
                rivet.position.set(x * (w / 2 + 0.015), y * (h / 2), z * (d / 2 + 0.015));
                rivet.rotation.x = Math.PI / 2;
                partyBoxGroup.add(rivet);
            });
        });
    });

    partyBoxGroup.position.set(1.9, -0.09, -0.2);
    partyBoxGroup.rotation.set(0, -0.42, 0);

    scene.add(partyBoxGroup);
}

// ============================================================================
// WALD & FENSTER (NUR DURCH FENSTER SICHTBAR)
// ============================================================================
function buildWindowAndDarkForest() {
    windowGroup = new THREE.Group();
    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    // Wald-Textur Canvas
    const forestCanvas = document.createElement('canvas');
    forestCanvas.width = 1024;
    forestCanvas.height = 1024;
    const fCtx = forestCanvas.getContext('2d');

    const skyGrad = fCtx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#040914');
    skyGrad.addColorStop(0.5, '#02050b');
    skyGrad.addColorStop(1, '#000103');
    fCtx.fillStyle = skyGrad;
    fCtx.fillRect(0, 0, 1024, 1024);

    function drawPineTree(x, y, scale, color) {
        fCtx.fillStyle = color;
        fCtx.beginPath();
        fCtx.moveTo(x, y - 400 * scale);
        for (let b = 0; b < 6; b++) {
            const bY = y - (400 - b * 60) * scale;
            const bW = (50 + b * 25) * scale;
            fCtx.lineTo(x + bW, bY + 30 * scale);
            fCtx.lineTo(x + bW * 0.5, bY + 30 * scale);
        }
        fCtx.lineTo(x, y);
        for (let b = 5; b >= 0; b--) {
            const bY = y - (400 - b * 60) * scale;
            const bW = (50 + b * 25) * scale;
            fCtx.lineTo(x - bW * 0.5, bY + 30 * scale);
            fCtx.lineTo(x - bW, bY + 30 * scale);
        }
        fCtx.closePath();
        fCtx.fill();
    }

    for (let i = 0; i < 20; i++) drawPineTree(Math.random() * 1024, 700, 0.4 + Math.random() * 0.3, '#030812');
    for (let i = 0; i < 15; i++) drawPineTree(Math.random() * 1024, 880, 0.7 + Math.random() * 0.3, '#02050a');
    for (let i = 0; i < 10; i++) drawPineTree(i * 100 + Math.random() * 30, 1024, 1.1 + Math.random() * 0.4, '#010204');

    const forestTexture = new THREE.CanvasTexture(forestCanvas);
    const forestPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(wW, wH),
        new THREE.MeshBasicMaterial({ map: forestTexture })
    );
    forestPlane.position.z = -0.2;
    windowGroup.add(forestPlane);

    // Glasscheibe
    const glassMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(wW, wH),
        new THREE.MeshStandardMaterial({ color: 0x142233, roughness: 0.04, transparent: true, opacity: 0.55 })
    );
    glassMesh.position.z = 0.01;
    windowGroup.add(glassMesh);

    // Fensterrahmen
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x06060a, roughness: 0.85 });
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.3, 0.2, 0.25), frameMat);
    topFrame.position.y = wH / 2 + 0.1;
    const botFrame = topFrame.clone();
    botFrame.position.y = -(wH / 2 + 0.1);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, wH, 0.25), frameMat);
    leftFrame.position.x = -(wW / 2 + 0.1);
    const rightFrame = leftFrame.clone();
    rightFrame.position.x = wW / 2 + 0.1;

    windowGroup.add(topFrame, botFrame, leftFrame, rightFrame);

    [-1.2, 0, 1.2].forEach(x => {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, wH, 0.12), frameMat);
        vBar.position.set(x, 0, 0.05);
        windowGroup.add(vBar);
    });

    [-0.8, 0.8].forEach(y => {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(wW, 0.08, 0.12), frameMat);
        hBar.position.set(0, y, 0.05);
        windowGroup.add(hBar);
    });

    windowGroup.position.copy(wPos);
    scene.add(windowGroup);
}

// ============================================================================
// REALISTISCHE REGEN-STRICHE (RAIN STREAKS) & WASSERTROPFEN
// ============================================================================
function buildRainPhysics() {
    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    // 1. Fallende Regenstriche
    const streakGeo = new THREE.BufferGeometry();
    const streakPos = new Float32Array(CONFIG.rain.streakCount * 6); // 2 Punkte pro Strich

    for (let i = 0; i < CONFIG.rain.streakCount * 6; i += 6) {
        const rx = wPos.x + (Math.random() - 0.5) * (wW - 0.2);
        const ry = wPos.y + (Math.random() - 0.5) * (wH - 0.2);
        const rz = wPos.z - 0.05;

        // Startpunkt
        streakPos[i] = rx;
        streakPos[i + 1] = ry;
        streakPos[i + 2] = rz;

        // Endpunkt (Länge des Strichs)
        streakPos[i + 3] = rx - 0.04;
        streakPos[i + 4] = ry - 0.25;
        streakPos[i + 5] = rz;
    }

    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
    const streakMat = new THREE.LineBasicMaterial({
        color: 0x88bbff,
        transparent: true,
        opacity: 0.75
    });

    rainLineSystem = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(rainLineSystem);

    // 2. Rinnende Tropfen an der Scheibe
    const dropGeo = new THREE.BufferGeometry();
    const dropPos = new Float32Array(CONFIG.rain.dropCount * 3);
    const dropData = [];

    for (let i = 0; i < CONFIG.rain.dropCount * 3; i += 3) {
        dropPos[i] = wPos.x + (Math.random() - 0.5) * (wW - 0.3);
        dropPos[i + 1] = wPos.y + (Math.random() - 0.5) * (wH - 0.3);
        dropPos[i + 2] = wPos.z + 0.02;

        dropData.push({ speedY: Math.random() * 0.006 + 0.002, life: Math.random() });
    }

    dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
    const dropMat = new THREE.PointsMaterial({ color: 0xcce6ff, size: 0.045, transparent: true, opacity: 0.85 });

    glassDropletsSystem = new THREE.Points(dropGeo, dropMat);
    glassDropletsSystem.userData = dropData;
    scene.add(glassDropletsSystem);
}

// ============================================================================
// ANIMATION PIPELINE
// ============================================================================
function animateEngine() {
    requestAnimationFrame(animateEngine);

    const delta = clock.getDelta();
    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    // Kamera-Dämpfung
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    camera.position.x = CONFIG.camera.basePos.x + mouseX * 0.25;
    camera.position.y = CONFIG.camera.basePos.y - mouseY * 0.12;
    camera.lookAt(CONFIG.camera.lookAt);

    // 1. Regenstriche bewegen
    if (rainLineSystem) {
        const pos = rainLineSystem.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 6) {
            pos[i + 1] -= 0.22;     // Start Y
            pos[i + 4] -= 0.22;     // Ende Y
            pos[i] -= 0.03;         // Wind X
            pos[i + 3] -= 0.03;

            // Zurücksetzen wenn unten aus dem Fenster gefallen
            if (pos[i + 1] < wPos.y - wH / 2) {
                const newX = wPos.x + (Math.random() - 0.5) * (wW - 0.2);
                pos[i] = newX;
                pos[i + 1] = wPos.y + wH / 2;
                pos[i + 3] = newX - 0.04;
                pos[i + 4] = wPos.y + wH / 2 - 0.25;
            }
        }
        rainLineSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Rinnende Tropfen bewegen
    if (glassDropletsSystem) {
        const pos = glassDropletsSystem.geometry.attributes.position.array;
        const data = glassDropletsSystem.userData;

        for (let i = 0; i < data.length; i++) {
            const idx = i * 3;
            pos[idx + 1] -= data[i].speedY;
            data[i].life -= delta * 0.3;

            if (data[i].life <= 0 || pos[idx + 1] < wPos.y - wH / 2) {
                pos[idx] = wPos.x + (Math.random() - 0.5) * (wW - 0.3);
                pos[idx + 1] = wPos.y + (Math.random() - 0.5) * (wH - 0.3);
                data[i].life = Math.random() * 0.8 + 0.2;
            }
        }
        glassDropletsSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Blitzeffekt
    if (Math.random() > 0.991) {
        lightningLight.intensity = 200 + Math.random() * 220;
    } else {
        lightningLight.intensity *= 0.78;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
