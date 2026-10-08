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
    renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
    setupLighting();
    createProceduralRealisticFloor(); // Lädt deine echten Bilder für den Boden
    createGroundedDetailedCrate();
    createLargeAtmosphericWindow();

    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x222538, 1.2);
    scene.add(ambientLight);

    const warmSpot = new THREE.SpotLight(0xffb866, 180, 18, Math.PI / 3.5, 0.6);
    warmSpot.position.set(-3.5, 4.5, 4);
    warmSpot.target.position.set(0, -1.2, 0);
    scene.add(warmSpot);
    scene.add(warmSpot.target);

    const boxSpot = new THREE.SpotLight(0xffaa55, 120, 12, Math.PI / 4, 0.5);
    boxSpot.position.set(3, 4, 3);
    boxSpot.target.position.set(2, -1.2, 0);
    scene.add(boxSpot);
    scene.add(boxSpot.target);

    lightningLight = new THREE.PointLight(0x88ccff, 0, 30);
    lightningLight.position.set(1.5, 2.5, -4.5);
    scene.add(lightningLight);
}

/* 1. EDLER, REALISTISCHER DIELENBODEN MIT ECHTEN TEXTUREN */
function createProceduralRealisticFloor() {
    const loader = new THREE.TextureLoader();

    const colorMap = loader.load("color.jpg");
    const normalMap = loader.load("normal.jpg");
    const roughnessMap = loader.load("roughness.jpg");

    // Richtige Farbbehandlung
    colorMap.colorSpace = THREE.SRGBColorSpace;

    // Textur deutlich öfter wiederholen
    colorMap.wrapS = THREE.RepeatWrapping;
    colorMap.wrapT = THREE.RepeatWrapping;

    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    colorMap.repeat.set(10, 7);
    normalMap.repeat.set(10, 7);
    roughnessMap.repeat.set(10, 7);

    // Schärfere Textur bei schrägem Blickwinkel
    colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    roughnessMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const material = new THREE.MeshPhysicalMaterial({
        map: colorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,

        // Material selbst
        roughness: 0.28,
        metalness: 0.15,

        // leichte glänzende Oberfläche
        clearcoat: 0.35,
        clearcoatRoughness: 0.18,

        normalScale: new THREE.Vector2(1.4, 1.4)
    });

    const geometry = new THREE.PlaneGeometry(30, 20, 128, 128);

    const floor = new THREE.Mesh(geometry, material);

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;

    floor.receiveShadow = true;

    scene.add(floor);
}
    const textureLoader = new THREE.TextureLoader();

    // Lade die 3 heruntergeladenen Bilddateien aus deinem Ordner
    const colorMap = textureLoader.load('color.jpg');
    const normalMap = textureLoader.load('normal.jpg');
    const roughnessMap = textureLoader.load('roughness.jpg');

    // Kachelung/Größe der Dielen einstellen
    [colorMap, normalMap, roughnessMap].forEach(tex => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 4);
    });

    // Material mit echten 3D-Rillen und Lichtreflexionen
    const floorMat = new THREE.MeshStandardMaterial({
        map: colorMap,
        normalMap: normalMap,       // Erzeugt echte 3D-Tiefe im Licht
        roughnessMap: roughnessMap, // Erzeugt den echten Glanz
    });

    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    
    scene.add(floor);
}

/* 2. HOCHDETAILLIERTE KISTE (FEST AUF DEM BODEN) */
function createGroundedDetailedCrate() {
    partyBoxGroup = new THREE.Group();

    const w = 2.2, h = 2.2, d = 2.2;

    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.75
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(2.0, -1.19, -0.2);
    scene.add(shadow);

    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x5c3619, roughness: 0.55 });
    const crateBody = new THREE.Mesh(boxGeo, boxMat);
    partyBoxGroup.add(crateBody);

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

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x422612, roughness: 0.6 });
    const diagGeo = new THREE.BoxGeometry(w * 1.25, 0.22, 0.08);
    const diag = new THREE.Mesh(diagGeo, frameMat);
    diag.position.z = d / 2 + 0.02;
    diag.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag);

    const boxBottomY = -1.2 + (h / 2);
    partyBoxGroup.position.set(2.0, boxBottomY, -0.2);
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
        color: 0x1c2d42,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = 0.02;
    windowGroup.add(glass);

    const barMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.8 });
    
    [-1.1, 0, 1.1].forEach(x => {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.2), barMat);
        vBar.position.set(x, 0, 0.05);
        windowGroup.add(vBar);
    });

    [-0.8, 0, 0.8].forEach(y => {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.2), barMat);
        hBar.position.set(0, y, 0.05);
        windowGroup.add(hBar);
    });

    windowGroup.position.set(1.8, 2.3, -4.2);
    scene.add(windowGroup);

    const rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = 1.8 + (Math.random() - 0.5) * 6;
        rainPos[i + 1] = Math.random() * 5 - 1;
        rainPos[i + 2] = -4.0 + (Math.random() - 0.5) * 1.2;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88bbff,
        size: 0.045,
        transparent: true,
        opacity: 0.75
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function animate() {
    requestAnimationFrame(animate);

    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.18;
            if (positions[i] < -1.2) {
                positions[i] = 4.2;
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (Math.random() > 0.988) {
        lightningLight.intensity = 150 + Math.random() * 180;
    } else {
        lightningLight.intensity *= 0.82;
    }

    camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.2 + 1.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.4, 0);

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
