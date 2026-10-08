/**
 * ============================================================================
 * PARTY CHAOS - HIGH-FIDELITY 3D NOIR ENGINE v3.0 (EXTENDED AAA SUITE)
 * Real-time WebGL Renderer with Custom Procedural Texturing & Particle Physics
 * Target File Length: > 1000 Lines
 * ============================================================================
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================================
// 1. ENGINE CORE STATE & SYSTEM VARIABLES
// ============================================================================
let scene, camera, renderer;
let partyBoxGroup, floorGroup, windowGroup, forestGroup, uiLightGroup;
let rainParticles, splashParticles, streakParticles, fogParticles;
let ambientLight, windowMoonLight, crateWarmLight, lightningLight, godRayLight;
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
let clock = new THREE.Clock();

// Configuration Pipeline
const ENGINE_CONFIG = {
    rendering: {
        antialias: true,
        shadows: true,
        pixelRatioLimit: 2.0,
        exposure: 0.82,
        fogDensity: 0.042,
        clearColor: 0x010204
    },
    camera: {
        fov: 42,
        near: 0.1,
        far: 120,
        basePos: new THREE.Vector3(0, 1.45, 8.0),
        lookAt: new THREE.Vector3(0, 0.25, 0),
        dampening: 0.04
    },
    lighting: {
        ambientColor: 0x0a1018,
        ambientIntensity: 0.85,
        moonColor: 0x3d6494,
        moonIntensity: 160,
        warmColor: 0xaa5b28,
        warmIntensity: 45,
        lightningColor: 0x88ccff
    },
    rainSystem: {
        rainCount: 650,
        splashCount: 300,
        streakCount: 200,
        fogCount: 80,
        windowBounds: {
            width: 4.4,
            height: 3.4,
            center: new THREE.Vector3(1.85, 2.2, -4.5)
        }
    }
};

// Auto-Init System Entry Point
window.addEventListener("DOMContentLoaded", () => {
    bootstrap3DEngine();
    runAnimationPipeline();
});

// ============================================================================
// 2. ENGINE INITIALIZATION PIPELINE
// ============================================================================
function bootstrap3DEngine() {
    // Scene Construction
    scene = new THREE.Scene();
    scene.background = new THREE.Color(ENGINE_CONFIG.rendering.clearColor);
    scene.fog = new THREE.FogExp2(
        ENGINE_CONFIG.rendering.clearColor,
        ENGINE_CONFIG.rendering.fogDensity
    );

    // Camera Configuration
    camera = new THREE.PerspectiveCamera(
        ENGINE_CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        ENGINE_CONFIG.camera.near,
        ENGINE_CONFIG.camera.far
    );
    camera.position.copy(ENGINE_CONFIG.camera.basePos);

    // Canvas & WebGL Renderer Pipeline
    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: ENGINE_CONFIG.rendering.antialias,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ENGINE_CONFIG.rendering.pixelRatioLimit));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = ENGINE_CONFIG.rendering.exposure;
    renderer.shadowMap.enabled = ENGINE_CONFIG.rendering.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Component Build Steps
    constructLightingPipeline();
    constructProceduralFloorSystem();
    constructHyperDetailedCrate();
    constructForestAndWindowEnvironment();
    constructVolumetricRainAndDroplets();
    constructAtmosphericFogSystem();
    constructInteractiveHUDHooks();

    // Event Listeners
    window.addEventListener("resize", handleWindowResize);
}

// ============================================================================
// 3. ADVANCED LIGHTING & VOLUMETRIC GOD RAYS
// ============================================================================
function constructLightingPipeline() {
    // Ambient Base Pass
    ambientLight = new THREE.AmbientLight(
        ENGINE_CONFIG.lighting.ambientColor,
        ENGINE_CONFIG.lighting.ambientIntensity
    );
    scene.add(ambientLight);

    // Window Moonlight (Primary Directional Key Light)
    windowMoonLight = new THREE.SpotLight(
        ENGINE_CONFIG.lighting.moonColor,
        ENGINE_CONFIG.lighting.moonIntensity,
        18,
        Math.PI / 3.2,
        0.55
    );
    windowMoonLight.position.set(1.85, 2.5, -4.3);
    windowMoonLight.target.position.set(-0.5, -1.0, 1.5);
    windowMoonLight.castShadow = true;
    windowMoonLight.shadow.mapSize.width = 1024;
    windowMoonLight.shadow.mapSize.height = 1024;
    windowMoonLight.shadow.bias = -0.0001;
    scene.add(windowMoonLight);
    scene.add(windowMoonLight.target);

    // Warm Key Light (Highlighting Crate Details)
    crateWarmLight = new THREE.SpotLight(
        ENGINE_CONFIG.lighting.warmColor,
        ENGINE_CONFIG.lighting.warmIntensity,
        12,
        Math.PI / 4,
        0.85
    );
    crateWarmLight.position.set(3.8, 2.8, 3.2);
    crateWarmLight.target.position.set(1.9, -0.2, -0.2);
    crateWarmLight.castShadow = true;
    scene.add(crateWarmLight);
    scene.add(crateWarmLight.target);

    // Lightning Flash Light Source
    lightningLight = new THREE.PointLight(ENGINE_CONFIG.lighting.lightningColor, 0, 60);
    lightningLight.position.set(1.85, 2.8, -6.5);
    scene.add(lightningLight);

    // Volumetric Light Cone Simulation (God Rays Pass)
    const rayGeometry = new THREE.ConeGeometry(3.8, 9.5, 32, 1, true);
    const rayMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a77aa,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    godRayLight = new THREE.Mesh(rayGeometry, rayMaterial);
    godRayLight.position.set(1.0, 0.8, -1.5);
    godRayLight.rotation.x = Math.PI / 2.8;
    godRayLight.rotation.z = -Math.PI / 6;
    scene.add(godRayLight);
}

// ============================================================================
// 4. PROCEDURAL HIGH-RESOLUTION WOODEN FLOOR
// ============================================================================
function constructProceduralFloorSystem() {
    floorGroup = new THREE.Group();

    // High-Resolution Diffuse Texture Generation (2048x2048)
    const diffuseCanvas = document.createElement('canvas');
    diffuseCanvas.width = 2048;
    diffuseCanvas.height = 2048;
    const dCtx = diffuseCanvas.getContext('2d');

    // Base Color
    dCtx.fillStyle = '#1a0e07';
    dCtx.fillRect(0, 0, 2048, 2048);

    // Wood Grain Procedural Fibers
    for (let i = 0; i < 5000; i++) {
        const dark = Math.random() > 0.45;
        dCtx.fillStyle = dark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        const y = Math.random() * 2048;
        const h = Math.random() * 3 + 1;
        dCtx.fillRect(0, y, 2048, h);
    }

    // Organic Wood Knots
    for (let k = 0; k < 24; k++) {
        const kx = Math.random() * 2048;
        const ky = Math.random() * 2048;
        const kr = Math.random() * 30 + 10;
        const knotGrad = dCtx.createRadialGradient(kx, ky, 2, kx, ky, kr);
        knotGrad.addColorStop(0, '#090402');
        knotGrad.addColorStop(0.7, '#24130a');
        knotGrad.addColorStop(1, 'transparent');
        dCtx.fillStyle = knotGrad;
        dCtx.beginPath();
        dCtx.arc(kx, ky, kr, 0, Math.PI * 2);
        dCtx.fill();
    }

    // Plank Seams & Grooves
    dCtx.fillStyle = '#020101';
    const plankH = 128;
    for (let y = 0; y < 2048; y += plankH) {
        dCtx.fillRect(0, y, 2048, 8);
    }

    const diffuseTex = new THREE.CanvasTexture(diffuseCanvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;
    diffuseTex.repeat.set(3, 5);

    // Procedural Normal Map Generation
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 1024;
    normalCanvas.height = 1024;
    const nCtx = normalCanvas.getContext('2d');
    nCtx.fillStyle = 'rgb(128, 128, 255)';
    nCtx.fillRect(0, 0, 1024, 1024);

    for (let y = 0; y < 1024; y += 64) {
        nCtx.fillStyle = 'rgb(255, 128, 128)';
        nCtx.fillRect(0, y, 1024, 4);
    }
    const normalTex = new THREE.CanvasTexture(normalCanvas);
    normalTex.wrapS = THREE.RepeatWrapping;
    normalTex.wrapT = THREE.RepeatWrapping;
    normalTex.repeat.set(3, 5);

    // Material Definition
    const floorMat = new THREE.MeshStandardMaterial({
        map: diffuseTex,
        normalMap: normalTex,
        normalScale: new THREE.Vector2(0.4, 0.4),
        roughness: 0.32,
        metalness: 0.08
    });

    const floorGeo = new THREE.PlaneGeometry(32, 22);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.2;
    floorMesh.receiveShadow = true;
    floorGroup.add(floorMesh);

    // Metallic Fastener Screw Details
    const nailGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8);
    const nailMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.2, metalness: 0.9 });

    for (let x = -14; x <= 14; x += 1.2) {
        for (let z = -9; z <= 9; z += 1.8) {
            const nail1 = new THREE.Mesh(nailGeo, nailMat);
            nail1.position.set(x - 0.15, -1.192, z);
            const nail2 = new THREE.Mesh(nailGeo, nailMat);
            nail2.position.set(x + 0.15, -1.192, z);
            floorGroup.add(nail1, nail2);
        }
    }

    scene.add(floorGroup);
}

// ============================================================================
// 5. HYPER-DETAILED RESIDENT EVIL CRATE MODEL
// ============================================================================
function constructHyperDetailedCrate() {
    partyBoxGroup = new THREE.Group();
    const w = 2.2, h = 2.2, d = 2.2;

    // Contact Shadow AO Plane
    const shadowGeo = new THREE.PlaneGeometry(3.8, 3.8);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.92
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(1.9, -1.192, -0.2);
    scene.add(shadowMesh);

    // Core Block
    const coreGeo = new THREE.BoxGeometry(w - 0.06, h - 0.06, d - 0.06);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x100804, roughness: 0.95 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    partyBoxGroup.add(coreMesh);

    // Materials
    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x482a15, roughness: 0.58 });
    const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x2b180b, roughness: 0.68 });
    const reinforcedMetalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.28, metalness: 0.92 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x505060, roughness: 0.18, metalness: 0.98 });

    // Layered Wooden Side Planks
    const plankCount = 5;
    const pHeight = (h - 0.1) / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        // Front Planks
        const fPlank = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, pHeight - 0.03, 0.05), woodPlankMat);
        fPlank.position.set(0, yPos, d / 2);
        fPlank.castShadow = true;
        fPlank.receiveShadow = true;
        partyBoxGroup.add(fPlank);

        // Back Planks
        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);

        // Left Planks
        const lPlank = new THREE.Mesh(new THREE.BoxGeometry(0.05, pHeight - 0.03, d - 0.08), woodPlankMat);
        lPlank.position.set(-w / 2, yPos, 0);
        lPlank.castShadow = true;
        lPlank.receiveShadow = true;
        partyBoxGroup.add(lPlank);

        // Right Planks
        const rPlank = lPlank.clone();
        rPlank.position.x = w / 2;
        partyBoxGroup.add(rPlank);
    }

    // Diagonal Cross Bracing
    const diagGeo = new THREE.BoxGeometry(w * 1.22, 0.16, 0.07);
    const diagFront1 = new THREE.Mesh(diagGeo, darkFrameMat);
    diagFront1.position.z = d / 2 + 0.025;
    diagFront1.rotation.z = Math.PI / 4;
    diagFront1.castShadow = true;
    partyBoxGroup.add(diagFront1);

    const diagFront2 = new THREE.Mesh(diagGeo, darkFrameMat);
    diagFront2.position.z = d / 2 + 0.025;
    diagFront2.rotation.z = -Math.PI / 4;
    diagFront2.castShadow = true;
    partyBoxGroup.add(diagFront2);

    // Reinforced Steel Corner Assemblies with Rivets
    const cornerGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    const rivetGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, reinforcedMetalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                corner.castShadow = true;
                partyBoxGroup.add(corner);

                // Rivet Head
                const rivet = new THREE.Mesh(rivetGeo, boltMat);
                rivet.position.set(x * (w / 2 + 0.015), y * (h / 2), z * (d / 2 + 0.015));
                rivet.rotation.x = Math.PI / 2;
                partyBoxGroup.add(rivet);
            });
        });
    });

    // Steel Lock Plate Hasp
    const lockHaspGeo = new THREE.BoxGeometry(0.2, 0.35, 0.06);
    const lockHasp = new THREE.Mesh(lockHaspGeo, reinforcedMetalMat);
    lockHasp.position.set(0, 0.1, d / 2 + 0.06);
    partyBoxGroup.add(lockHasp);

    // Final Assembly Position & Angle
    partyBoxGroup.position.set(1.9, -0.09, -0.2);
    partyBoxGroup.rotation.set(0, -0.42, 0);

    scene.add(partyBoxGroup);
}

// ============================================================================
// 6. DETAILED FOREST & NOIR WINDOW ENVIRONMENT
// ============================================================================
function constructForestAndWindowEnvironment() {
    windowGroup = new THREE.Group();
    const wWidth = 4.4;
    const wHeight = 3.4;

    // Procedural Forest Texture Canvas (2048x2048)
    const forestCanvas = document.createElement('canvas');
    forestCanvas.width = 2048;
    forestCanvas.height = 2048;
    const fCtx = forestCanvas.getContext('2d');

    // Sky Background Gradient
    const skyGradient = fCtx.createLinearGradient(0, 0, 0, 2048);
    skyGradient.addColorStop(0, '#040914');
    skyGradient.addColorStop(0.4, '#02050b');
    skyGradient.addColorStop(1, '#000103');
    fCtx.fillStyle = skyGradient;
    fCtx.fillRect(0, 0, 2048, 2048);

    // Detailed Pine Tree Drawing Algorithm
    function drawPineTree(x, y, scale, color, branchLayers) {
        fCtx.fillStyle = color;
        fCtx.beginPath();
        fCtx.moveTo(x, y - 500 * scale);

        for (let b = 0; b < branchLayers; b++) {
            const branchY = y - (500 - b * (500 / branchLayers)) * scale;
            const branchWidth = (60 + b * 32) * scale;
            fCtx.lineTo(x + branchWidth, branchY + 40 * scale);
            fCtx.lineTo(x + branchWidth * 0.55, branchY + 40 * scale);
        }
        fCtx.lineTo(x, y);
        for (let b = branchLayers - 1; b >= 0; b--) {
            const branchY = y - (500 - b * (500 / branchLayers)) * scale;
            const branchWidth = (60 + b * 32) * scale;
            fCtx.lineTo(x - branchWidth * 0.55, branchY + 40 * scale);
            fCtx.lineTo(x - branchWidth, branchY + 40 * scale);
        }
        fCtx.closePath();
        fCtx.fill();
    }

    // Render Forest Depth Layers
    for (let i = 0; i < 35; i++) {
        drawPineTree(Math.random() * 2048, 1400, 0.35 + Math.random() * 0.25, '#030812', 8);
    }
    for (let i = 0; i < 22; i++) {
        drawPineTree(Math.random() * 2048, 1700, 0.65 + Math.random() * 0.3, '#02050a', 10);
    }
    for (let i = 0; i < 14; i++) {
        drawPineTree(i * 150 + Math.random() * 50, 2048, 1.1 + Math.random() * 0.4, '#010204', 12);
    }

    const forestTexture = new THREE.CanvasTexture(forestCanvas);
    const forestGeo = new THREE.PlaneGeometry(wWidth * 1.8, wHeight * 1.8);
    const forestMat = new THREE.MeshBasicMaterial({ map: forestTexture });
    const forestPlane = new THREE.Mesh(forestGeo, forestMat);
    forestPlane.position.z = -0.4;
    windowGroup.add(forestPlane);

    // Glass Window Pane
    const glassGeo = new THREE.PlaneGeometry(wWidth, wHeight);
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x142233,
        roughness: 0.04,
        transparent: true,
        opacity: 0.52
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0.01;
    windowGroup.add(glassMesh);

    // Frame & Mullions
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x06060a, roughness: 0.85 });

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(wWidth + 0.5, 0.28, 0.32), frameMat);
    topFrame.position.y = wHeight / 2 + 0.12;
    const botFrame = topFrame.clone();
    botFrame.position.y = -(wHeight / 2 + 0.12);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.28, wHeight, 0.32), frameMat);
    leftFrame.position.x = -(wWidth / 2 + 0.12);
    const rightFrame = leftFrame.clone();
    rightFrame.position.x = wWidth / 2 + 0.12;

    windowGroup.add(topFrame, botFrame, leftFrame, rightFrame);

    [-1.3, 0, 1.3].forEach(x => {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.11, wHeight, 0.18), frameMat);
        vBar.position.set(x, 0, 0.06);
        windowGroup.add(vBar);
    });

    [-0.85, 0.85].forEach(y => {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(wWidth, 0.11, 0.18), frameMat);
        hBar.position.set(0, y, 0.06);
        windowGroup.add(hBar);
    });

    windowGroup.position.copy(ENGINE_CONFIG.rainSystem.windowBounds.center);
    scene.add(windowGroup);
}

// ============================================================================
// 7. VOLUMETRIC RAIN & DROPLET MICRO-PHYSICS
// ============================================================================
function constructVolumetricRainAndDroplets() {
    const wBounds = ENGINE_CONFIG.rainSystem.windowBounds;

    // Outdoor Falling Raindrops
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(ENGINE_CONFIG.rainSystem.rainCount * 3);

    for (let i = 0; i < ENGINE_CONFIG.rainSystem.rainCount * 3; i += 3) {
        rainPos[i] = wBounds.center.x + (Math.random() - 0.5) * (wBounds.width - 0.2);
        rainPos[i + 1] = wBounds.center.y + (Math.random() - 0.5) * (wBounds.height - 0.2);
        rainPos[i + 2] = wBounds.center.z + 0.02;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
        color: 0x99ccff,
        size: 0.032,
        transparent: true,
        opacity: 0.78
    });
    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // Glass Impact & Runoff Droplets
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(ENGINE_CONFIG.rainSystem.splashCount * 3);
    const splashData = [];

    for (let i = 0; i < ENGINE_CONFIG.rainSystem.splashCount * 3; i += 3) {
        splashPos[i] = wBounds.center.x + (Math.random() - 0.5) * (wBounds.width - 0.3);
        splashPos[i + 1] = wBounds.center.y + (Math.random() - 0.5) * (wBounds.height - 0.3);
        splashPos[i + 2] = wBounds.center.z + 0.03;

        splashData.push({
            speedY: Math.random() * 0.008 + 0.002,
            life: Math.random()
        });
    }

    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
        color: 0xd0e8ff,
        size: 0.048,
        transparent: true,
        opacity: 0.88
    });
    splashParticles = new THREE.Points(splashGeo, splashMat);
    splashParticles.userData = splashData;
    scene.add(splashParticles);
}

// ============================================================================
// 8. ATMOSPHERIC FOG SYSTEM
// ============================================================================
function constructAtmosphericFogSystem() {
    const fogGeo = new THREE.BufferGeometry();
    const fogPos = new Float32Array(ENGINE_CONFIG.rainSystem.fogCount * 3);

    for (let i = 0; i < ENGINE_CONFIG.rainSystem.fogCount * 3; i += 3) {
        fogPos[i] = (Math.random() - 0.5) * 20;
        fogPos[i + 1] = Math.random() * 3 - 1;
        fogPos[i + 2] = (Math.random() - 0.5) * 10;
    }

    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
    const fogMat = new THREE.PointsMaterial({
        color: 0x223344,
        size: 0.6,
        transparent: true,
        opacity: 0.15
    });

    fogParticles = new THREE.Points(fogGeo, fogMat);
    scene.add(fogParticles);
}

// ============================================================================
// 9. INTERACTIVE HUD HOOKS & UI REACTION
// ============================================================================
function constructInteractiveHUDHooks() {
    window.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Public Menu Functions
    window.createGame = () => triggerHUDAlert("🎮 SPIEL WIRD ERSTELLT...");
    window.joinGame = () => triggerHUDAlert("🚪 LOBBY BEITRETEN...");
    window.openSettings = () => triggerHUDAlert("⚙️ EINSTELLUNGEN OEFNEN...");
    window.openInstructions = () => triggerHUDAlert("📜 ANLEITUNG ANZEIGEN...");
}

function triggerHUDAlert(messageText) {
    const hudNotification = document.createElement("div");
    hudNotification.style.position = "fixed";
    hudNotification.style.top = "24px";
    hudNotification.style.right = "24px";
    hudNotification.style.backgroundColor = "rgba(6, 10, 18, 0.92)";
    hudNotification.style.color = "#88ccff";
    hudNotification.style.padding = "14px 28px";
    hudNotification.style.borderLeft = "4px solid #3d6494";
    hudNotification.style.fontFamily = "monospace";
    hudNotification.style.fontSize = "14px";
    hudNotification.style.letterSpacing = "1px";
    hudNotification.style.zIndex = "9999";
    hudNotification.style.boxShadow = "0 12px 35px rgba(0,0,0,0.85)";
    hudNotification.innerText = messageText;
    document.body.appendChild(hudNotification);

    setTimeout(() => hudNotification.remove(), 2600);
}

// ============================================================================
// 10. ANIMATION PIPELINE & PHYSICS UPDATE
// ============================================================================
function runAnimationPipeline() {
    requestAnimationFrame(runAnimationPipeline);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Camera Motion Dampening (Parallax Inertia)
    mouseX += (targetMouseX - mouseX) * ENGINE_CONFIG.camera.dampening;
    mouseY += (targetMouseY - mouseY) * ENGINE_CONFIG.camera.dampening;

    camera.position.x = ENGINE_CONFIG.camera.basePos.x + mouseX * 0.28;
    camera.position.y = ENGINE_CONFIG.camera.basePos.y - mouseY * 0.14;
    camera.lookAt(ENGINE_CONFIG.camera.lookAt);

    // 2. Outdoor Rain Dynamics
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        const wBounds = ENGINE_CONFIG.rainSystem.windowBounds;

        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.24;
            if (positions[i] < wBounds.center.y - wBounds.height / 2) {
                positions[i] = wBounds.center.y + wBounds.height / 2;
                positions[i - 1] = wBounds.center.x + (Math.random() - 0.5) * (wBounds.width - 0.2);
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Glass Droplet Physics Update
    if (splashParticles) {
        const positions = splashParticles.geometry.attributes.position.array;
        const data = splashParticles.userData;
        const wBounds = ENGINE_CONFIG.rainSystem.windowBounds;

        for (let i = 0; i < data.length; i++) {
            const idx = i * 3;
            positions[idx + 1] -= data[i].speedY;
            data[i].life -= delta * 0.4;

            if (data[i].life <= 0 || positions[idx + 1] < wBounds.center.y - wBounds.height / 2) {
                positions[idx] = wBounds.center.x + (Math.random() - 0.5) * (wBounds.width - 0.3);
                positions[idx + 1] = wBounds.center.y + (Math.random() - 0.5) * (wBounds.height - 0.3);
                data[i].life = Math.random() * 0.9 + 0.1;
            }
        }
        splashParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Volumetric Fog Drift Animation
    if (fogParticles) {
        const positions = fogParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime * 0.2 + i) * 0.002;
        }
        fogParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Lightning Generator Logic Pass
    if (Math.random() > 0.991) {
        lightningLight.intensity = 220 + Math.random() * 260;
    } else {
        lightningLight.intensity *= 0.76;
    }

    // Render Scene Frame
    renderer.render(scene, camera);
}

// ============================================================================
// 11. WINDOW RESIZE EVENT HANDLER
// ============================================================================
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
