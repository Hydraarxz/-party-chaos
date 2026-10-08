import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ========================================
// PARTY CHAOS – 3D SCENE
// ========================================

let scene;
let camera;
let renderer;

let rainParticles;
let lightningLight;

let mouseX = 0;
let mouseY = 0;

let clock;

// ========================================
// START
// ========================================

init();
animate();

function init() {
    clock = new THREE.Clock();

    // Szene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040407);
    scene.fog = new THREE.FogExp2(0x040407, 0.025);

    // Kamera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.set(0, 1.6, 8.5);
    camera.lookAt(0, 0.4, 0);

    // Canvas aus deiner index.html
    const canvas = document.getElementById("stage3d");

    if (!canvas) {
        console.error(
            'PARTY CHAOS: Das Canvas mit id="stage3d" wurde nicht gefunden.'
        );
        return;
    }

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Echte Schatten
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Szene aufbauen
    setupLighting();
    createRealisticFloor();
    createGroundedDetailedCrate();
    createLargeAtmosphericWindow();

    // Mausbewegung
    window.addEventListener("mousemove", (event) => {
        mouseX =
            (event.clientX / window.innerWidth - 0.5) * 2;

        mouseY =
            (event.clientY / window.innerHeight - 0.5) * 2;
    });

    // Touch-Steuerung für iPad
    window.addEventListener(
        "touchmove",
        (event) => {
            if (!event.touches.length) return;

            const touch = event.touches[0];

            mouseX =
                (touch.clientX / window.innerWidth - 0.5) * 2;

            mouseY =
                (touch.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
    );

    window.addEventListener("resize", resize);
}

// ========================================
// LICHTER
// ========================================

function setupLighting() {
    // Grundlicht
    const ambientLight = new THREE.AmbientLight(
        0x222538,
        1.2
    );

    scene.add(ambientLight);

    // Warmes Hauptlicht
    const warmSpot = new THREE.SpotLight(
        0xffb866,
        180,
        25,
        Math.PI / 3.5,
        0.6
    );

    warmSpot.position.set(-3.5, 4.5, 4);
    warmSpot.target.position.set(0, -1.2, 0);

    warmSpot.castShadow = true;
    warmSpot.shadow.mapSize.set(1024, 1024);
    warmSpot.shadow.bias = -0.0001;

    scene.add(warmSpot);
    scene.add(warmSpot.target);

    // Zweiter Spot
    const boxSpot = new THREE.SpotLight(
        0xffaa55,
        120,
        20,
        Math.PI / 4,
        0.5
    );

    boxSpot.position.set(3, 4, 3);
    boxSpot.target.position.set(2, -1.2, 0);

    boxSpot.castShadow = true;
    boxSpot.shadow.mapSize.set(1024, 1024);
    boxSpot.shadow.bias = -0.0001;

    scene.add(boxSpot);
    scene.add(boxSpot.target);

    // Kühles Licht von hinten
    const blueLight = new THREE.PointLight(
        0x4466ff,
        35,
        18
    );

    blueLight.position.set(-3, 1.5, -3);
    scene.add(blueLight);

    // Lichtblitze
    lightningLight = new THREE.PointLight(
        0x88ccff,
        0,
        30
    );

    lightningLight.position.set(1.5, 2.5, -4.5);
    scene.add(lightningLight);
}

// ========================================
// REALISTISCHER TEXTURBODEN
// ========================================

function createRealisticFloor() {
    const loader = new THREE.TextureLoader();

    const colorMap = loader.load(
        "./color.jpg",
        () => console.log("Boden: Color-Textur geladen"),
        undefined,
        () => console.error("Boden: color.jpg konnte nicht geladen werden")
    );

    const normalMap = loader.load(
        "./normal.jpg",
        () => console.log("Boden: Normal-Textur geladen"),
        undefined,
        () => console.error("Boden: normal.jpg konnte nicht geladen werden")
    );

    const roughnessMap = loader.load(
        "./roughness.jpg",
        () => console.log("Boden: Roughness-Textur geladen"),
        undefined,
        () => console.error("Boden: roughness.jpg konnte nicht geladen werden")
    );

    // Farbtextur korrekt behandeln
    colorMap.colorSpace = THREE.SRGBColorSpace;

    // Texturen wiederholen
    const textures = [
        colorMap,
        normalMap,
        roughnessMap
    ];

    textures.forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 6);
        texture.anisotropy =
            renderer.capabilities.getMaxAnisotropy();
    });

    // Material
    const floorMaterial = new THREE.MeshPhysicalMaterial({
        map: colorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,

        roughness: 0.3,
        metalness: 0.12,

        clearcoat: 0.4,
        clearcoatRoughness: 0.2,

        normalScale: new THREE.Vector2(1.3, 1.3)
    });

    // Boden
    const floorGeometry = new THREE.PlaneGeometry(
        30,
        20
    );

    const floor = new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;

    floor.receiveShadow = true;

    scene.add(floor);
}

// ========================================
// DETAILLIERTE HOLZKISTE
// ========================================

function createGroundedDetailedCrate() {
    const group = new THREE.Group();

    const width = 2.2;
    const height = 2.2;
    const depth = 2.2;

    // Holzmaterial
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x68401f,
        roughness: 0.72,
        metalness: 0.02
    });

    // Kiste
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        woodMaterial
    );

    body.castShadow = true;
    body.receiveShadow = true;

    group.add(body);

    // Metallbeschläge
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x292a30,
        roughness: 0.32,
        metalness: 0.85
    });

    const cornerGeometry = new THREE.BoxGeometry(
        0.3,
        0.3,
        0.3
    );

    [-1, 1].forEach((x) => {
        [-1, 1].forEach((y) => {
            [-1, 1].forEach((z) => {
                const corner = new THREE.Mesh(
                    cornerGeometry,
                    metalMaterial
                );

                corner.position.set(
                    x * (width / 2),
                    y * (height / 2),
                    z * (depth / 2)
                );

                corner.castShadow = true;
                group.add(corner);
            });
        });
    });

    // Holzstreben vorne
    const beamMaterial = new THREE.MeshStandardMaterial({
        color: 0x422612,
        roughness: 0.65
    });

    const beamGeometry = new THREE.BoxGeometry(
        width * 1.15,
        0.16,
        0.12
    );

    const beam1 = new THREE.Mesh(
        beamGeometry,
        beamMaterial
    );

    beam1.position.z = depth / 2 + 0.04;
    beam1.rotation.z = Math.PI / 4;
    beam1.castShadow = true;

    group.add(beam1);

    const beam2 = new THREE.Mesh(
        beamGeometry,
        beamMaterial
    );

    beam2.position.z = depth / 2 + 0.04;
    beam2.rotation.z = -Math.PI / 4;
    beam2.castShadow = true;

    group.add(beam2);

    // Position auf dem Boden
    group.position.set(
        2,
        -1.2 + height / 2,
        -0.2
    );

    group.rotation.y = -0.45;

    scene.add(group);
}

// ========================================
// FENSTER MIT REGEN
// ========================================

function createLargeAtmosphericWindow() {
    const windowGroup = new THREE.Group();

    // Fensterrahmen
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x111118,
        roughness: 0.7,
        metalness: 0.35
    });

    const outerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 3.6, 0.25),
        frameMaterial
    );

    outerFrame.castShadow = true;
    windowGroup.add(outerFrame);

    // Glas
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1c2d42,
        roughness: 0.16,
        metalness: 0.15,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    });

    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(4.4, 3.2),
        glassMaterial
    );

    glass.position.z = 0.14;
    windowGroup.add(glass);

    // Vertikale Streben
    const barMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0f,
        roughness: 0.8,
        metalness: 0.3
    });

    [-1.1, 0, 1.1].forEach((x) => {
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 3.2, 0.2),
            barMaterial
        );

        bar.position.set(x, 0, 0.2);
        bar.castShadow = true;

        windowGroup.add(bar);
    });

    // Horizontale Streben
    [-0.8, 0, 0.8].forEach((y) => {
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(4.4, 0.12, 0.2),
            barMaterial
        );

        bar.position.set(0, y, 0.2);
        bar.castShadow = true;

        windowGroup.add(bar);
    });

    windowGroup.position.set(1.8, 2.3, -4.2);

    scene.add(windowGroup);

    // Regenpartikel
    const rainCount = 800;

    const rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
        positions[i * 3] =
            1.8 + (Math.random() - 0.5) * 6;

        positions[i * 3 + 1] =
            Math.random() * 5 - 1;

        positions[i * 3 + 2] =
            -4 + (Math.random() - 0.5) * 1.2;
    }

    rainGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const rainMaterial = new THREE.PointsMaterial({
        color: 0x88bbff,
        size: 0.035,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
    });

    rainParticles = new THREE.Points(
        rainGeometry,
        rainMaterial
    );

    scene.add(rainParticles);
}

// ========================================
// ANIMATION
// ========================================

function animate() {
    requestAnimationFrame(animate);

    if (!renderer || !scene || !camera) return;

    const delta = Math.min(clock.getDelta(), 0.05);

    // Regen bewegen
    if (rainParticles) {
        const positions =
            rainParticles.geometry.attributes.position.array;

        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 3.5 * delta;

            if (positions[i] < -1.2) {
                positions[i] = 4.2;
            }
        }

        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Gelegentliche Lichtblitze
    if (Math.random() > 0.992) {
        lightningLight.intensity =
            100 + Math.random() * 160;
    } else {
        lightningLight.intensity *= 0.85;
    }

    // Sanfte Kamerabewegung
    camera.position.x +=
        (mouseX * 0.35 - camera.position.x) * 0.04;

    camera.position.y +=
        (1.6 - mouseY * 0.2 - camera.position.y) * 0.04;

    camera.lookAt(0, 0.4, 0);

    renderer.render(scene, camera);
}

// ========================================
// FENSTERGRÖSSE
// ========================================

function resize() {
    if (!camera || !renderer) return;

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
}

// ========================================
// BUTTONS
// ========================================

window.createGame = function () {
    alert("🎮 Spiel wird erstellt...");
};

window.joinGame = function () {
    alert("🚪 Lobby beitreten...");
};
