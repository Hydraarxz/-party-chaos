import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040407);
    scene.fog = new THREE.FogExp2(0x040407, 0.035);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 8.5);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

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
    // Sanftes, düsteres Raumlicht
    const ambientLight = new THREE.AmbientLight(0x222538, 1.2);
    scene.add(ambientLight);

    // Hauptlicht: Warmes Licht, das atmosphärisch über den Dielenboden streift
    const warmSpot = new THREE.SpotLight(0xffb866, 180, 18, Math.PI / 3.5, 0.6);
    warmSpot.position.set(-3.5, 4.5, 4);
    warmSpot.target.position.set(0, -1.2, 0);
    scene.add(warmSpot);
    scene.add(warmSpot.target);

    // Kisten-Spotlight
    const boxSpot = new THREE.SpotLight(0xffaa55, 120, 12, Math.PI / 4, 0.5);
    boxSpot.position.set(3, 4, 3);
    boxSpot.target.position.set(2, -1.2, 0);
    scene.add(boxSpot);
    scene.add(boxSpot.target);

    // Blitzeffekt aus dem Fenster
    lightningLight = new THREE.PointLight(0x88ccff, 0, 30);
    lightningLight.position.set(1.5, 2.5, -4.5);
    scene.add(lightningLight);
}

/* 1. EDLER, REALISTISCHER DIELENBODEN (WIE IN BILD 2) */
function createProceduralRealisticFloor() {
    const floorGroup = new THREE.Group();

    // Dunkler Untergrund für die Rillen zwischen den Dielen
    const baseGeo = new THREE.PlaneGeometry(30, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x050302, roughness: 1.0 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = -1.25;
    floorGroup.add(base);

    // Generiere Textur per Canvas für Holzmaserung & Glanz
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Grundfarbe & Maserung zeichnen
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.04)';
        const y = Math.random() * 512;
        const h = Math.random() * 4 + 1;
        ctx.fillRect(0, y, 512, h);
    }

    const woodTexture = new THREE.CanvasTexture(canvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 8);

    const plankWidth = 0.55;
    const plankLength = 18;
    const plankColors = [0x422615, 0x361e10, 0x4a2c18, 0x2d180c, 0x52311b];

    const nailMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.3, metalness: 0.8 });
    const nailGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8);

    for (let x = -9; x <= 9; x += plankWidth + 0.015) {
        const color = plankColors[Math.floor(Math.random() * plankColors.length)];
        const plankGeo = new THREE.BoxGeometry(plankWidth, 0.04, plankLength);
        const textureLoader = new THREE.TextureLoader();

// Texturen laden
const colorMap = textureLoader.load('color.jpg');
const normalMap = textureLoader.load('normal.jpg');
const roughnessMap = textureLoader.load('roughness.jpg');

// Kachelung/Wiederholung einstellen, damit die Bohlen klein & fein wirken
[colorMap, normalMap, roughnessMap].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4); // Je höher die Zahl, desto feiner das Muster
});

// Boden-Material erstellen
const floorMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap: normalMap,       // Macht die Rillen extrem realistisch!
    roughnessMap: roughnessMap, // Macht die Glanzpunkte realistisch!
});

const floorGeo = new THREE.PlaneGeometry(30, 20);
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
scene.add(floor);

