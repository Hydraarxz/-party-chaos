import { createUltraDetailedCrate } from './crate.js';
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, floorGroup, windowGroup, roomGroup;
let rainLineSystem;
let ambientLight, windowMoonLight, crateWarmLight, lightningLight;
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
let clock = new THREE.Clock();

const CONFIG = {
    camera: { fov: 42, basePos: new THREE.Vector3(0, 1.45, 8.0), lookAt: new THREE.Vector3(0, 0.25, 0) },
    window: { width: 4.2, height: 3.2, pos: new THREE.Vector3(1.8, 2.2, -4.5) },
    rain: { streakCount: 500 }
};

window.addEventListener("DOMContentLoaded", () => {
    initEngine();
    animateEngine();
});

function initEngine() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010204);
    scene.fog = new THREE.FogExp2(0x010204, 0.042);

    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.copy(CONFIG.camera.basePos);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    setupLighting();
    buildRoomWalls();
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

function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x121a24, 1.1);
    scene.add(ambientLight);

    windowMoonLight = new THREE.SpotLight(0x3d6494, 140, 16, Math.PI / 3.2, 0.55);
    windowMoonLight.position.set(CONFIG.window.pos.x, CONFIG.window.pos.y + 0.3, CONFIG.window.pos.z + 0.2);
    windowMoonLight.target.position.set(-0.5, -1.0, 1.5);
    scene.add(windowMoonLight);
    scene.add(windowMoonLight.target);

    crateWarmLight = new THREE.SpotLight(0xc87038, 80, 12, Math.PI / 3.5, 0.6);
    crateWarmLight.position.set(3.2, 2.8, 3.5);
    crateWarmLight.target.position.set(1.9, -0.1, -0.2);
    scene.add(crateWarmLight);
    scene.add(crateWarmLight.target);

    lightningLight = new THREE.PointLight(0x88ccff, 0, 60);
    lightningLight.position.set(CONFIG.window.pos.x, CONFIG.window.pos.y + 0.5, CONFIG.window.pos.z - 1.5);
    scene.add(lightningLight);
}

function buildRoomWalls() {
    roomGroup = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.9 });

    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 0.2), wallMat);
    leftWall.position.set(wPos.x - wW / 2 - 5, wPos.y, wPos.z);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 0.2), wallMat);
    rightWall.position.set(wPos.x + wW / 2 + 5, wPos.y, wPos.z);

    const topWall = new THREE.Mesh(new THREE.BoxGeometry(wW + 10, 5, 0.2), wallMat);
    topWall.position.set(wPos.x, wPos.y + wH / 2 + 2.5, wPos.z);

    const botWall = new THREE.Mesh(new THREE.BoxGeometry(wW + 10, 5, 0.2), wallMat);
    botWall.position.set(wPos.x, wPos.y - wH / 2 - 2.5, wPos.z);

    roomGroup.add(leftWall, rightWall, topWall, botWall);
    scene.add(roomGroup);
}

function buildProceduralFloor() {
    floorGroup = new THREE.Group();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c1008';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = Math.random() > 0.45 ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(0, Math.random() * 1024, 1024, Math.random() * 3 + 1);
    }

    ctx.fillStyle = '#020101';
    for (let y = 0; y < 1024; y += 64) {
        ctx.fillRect(0, y, 1024, 5);
    }

    const diffuseTex = new THREE.CanvasTexture(canvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;
    diffuseTex.repeat.set(3, 5);

    const floorMat = new THREE.MeshStandardMaterial({ map: diffuseTex, roughness: 0.35, metalness: 0.08 });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(32, 22), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.2;

    floorGroup.add(floorMesh);
    scene.add(floorGroup);
}

function buildDetailedCrate() {
    partyBoxGroup = new THREE.Group();
    const w = 2.2, h = 2.2, d = 2.2;

    const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 3.6),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.88 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(1.9, -1.192, -0.2);
    scene.add(shadowMesh);

    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const wCtx = woodCanvas.getContext('2d');
    wCtx.fillStyle = '#5a341a';
    wCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 800; i++) {
        wCtx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.05)';
        wCtx.fillRect(0, Math.random() * 512, 512, Math.random() * 4 + 1);
    }
    const crateWoodTex = new THREE.CanvasTexture(woodCanvas);

    const woodPlankMat = new THREE.MeshStandardMaterial({ map: crateWoodTex, color: 0x6e401f, roughness: 0.55 });
    const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x3d2210, roughness: 0.65 });
    const reinforcedMetalMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.3, metalness: 0.85 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.2, metalness: 0.95 });

    partyBoxGroup.add(new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, h - 0.08, d - 0.08), new THREE.MeshStandardMaterial({ color: 0x120a05 })));

    const plankCount = 5;
    const pHeight = (h - 0.1) / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        const fPlank = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, pHeight - 0.03, 0.06), woodPlankMat);
        fPlank.position.set(0, yPos, d / 2);
        partyBoxGroup.add(fPlank);

        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);

        const lPlank = new THREE.Mesh(new THREE.BoxGeometry(0.06, pHeight - 0.03, d - 0.1), woodPlankMat);
        lPlank.position.set(-w / 2, yPos, 0);
        partyBoxGroup.add(lPlank);

        const rPlank = lPlank.clone();
        rPlank.position.x = w / 2;
        partyBoxGroup.add(rPlank);
    }

    const diagGeo = new THREE.BoxGeometry(w * 1.2, 0.18, 0.08);
    const diag1 = new THREE.Mesh(diagGeo, darkFrameMat);
    diag1.position.z = d / 2 + 0.03;
    diag1.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag1);

    const diag2 = new THREE.Mesh(diagGeo, darkFrameMat);
    diag2.position.z = d / 2 + 0.03;
    diag2.rotation.z = -Math.PI / 4;
    partyBoxGroup.add(diag2);

    const cornerGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    const rivetGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.06, 8);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, reinforcedMetalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                partyBoxGroup.add(corner);

                const rivet = new THREE.Mesh(rivetGeo, boltMat);
                rivet.position.set(x * (w / 2 + 0.02), y * (h / 2), z * (d / 2 + 0.02));
                rivet.rotation.x = Math.PI / 2;
                partyBoxGroup.add(rivet);
            });
        });
    });

    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.05), reinforcedMetalMat);
    lockPlate.position.set(0, 0.1, d / 2 + 0.07);
    partyBoxGroup.add(lockPlate);

    partyBoxGroup.position.set(1.9, -0.09, -0.2);
    partyBoxGroup.rotation.set(0, -0.42, 0);

    scene.add(partyBoxGroup);
}

function buildWindowAndDarkForest() {
    windowGroup = new THREE.Group();
    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

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
    const forestPlane = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH), new THREE.MeshBasicMaterial({ map: forestTexture }));
    forestPlane.position.z = -0.2;
    windowGroup.add(forestPlane);

    const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH), new THREE.MeshStandardMaterial({ color: 0x142233, roughness: 0.04, transparent: true, opacity: 0.55 }));
    glassMesh.position.z = 0.01;
    windowGroup.add(glassMesh);

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

function buildRainPhysics() {
    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    const streakGeo = new THREE.BufferGeometry();
    const streakPos = new Float32Array(CONFIG.rain.streakCount * 6);

    for (let i = 0; i < CONFIG.rain.streakCount * 6; i += 6) {
        const rx = wPos.x + (Math.random() - 0.5) * (wW - 0.2);
        const ry = wPos.y + (Math.random() - 0.5) * (wH - 0.2);
        const rz = wPos.z - 0.05;

        streakPos[i] = rx;
        streakPos[i + 1] = ry;
        streakPos[i + 2] = rz;

        streakPos[i + 3] = rx - 0.04;
        streakPos[i + 4] = ry - 0.25;
        streakPos[i + 5] = rz;
    }

    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
    const streakMat = new THREE.LineBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.75 });

    rainLineSystem = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(rainLineSystem);
}

function animateEngine() {
    requestAnimationFrame(animateEngine);

    const wW = CONFIG.window.width;
    const wH = CONFIG.window.height;
    const wPos = CONFIG.window.pos;

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    camera.position.x = CONFIG.camera.basePos.x + mouseX * 0.25;
    camera.position.y = CONFIG.camera.basePos.y - mouseY * 0.12;
    camera.lookAt(CONFIG.camera.lookAt);

    if (rainLineSystem) {
        const pos = rainLineSystem.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 6) {
            pos[i + 1] -= 0.22;
            pos[i + 4] -= 0.22;
            pos[i] -= 0.03;
            pos[i + 3] -= 0.03;

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
window.openSettings = () => alert("⚙️ Einstellungen...");
window.openInstructions = () => alert("📜 Anleitung...");
