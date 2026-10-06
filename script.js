import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.04);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.8, 9);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    setupLighting();
    createFloor();
    createCrate();
    createWindowAndRain();

    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x33334e, 1.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffb066, 180, 18, Math.PI / 3, 0.5);
    spotLight.position.set(4, 5, 4);
    spotLight.target.position.set(2, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    lightningLight = new THREE.PointLight(0x77b8ff, 0, 35);
    lightningLight.position.set(2.5, 3, -5);
    scene.add(lightningLight);
}

/* 1. HOLZBODEN */
function createFloor() {
    const floorGroup = new THREE.Group();

    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x3d2312,
        roughness: 0.4,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floorGroup.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0x1f1209, 0x1f1209);
    grid.position.y = -1.19;
    floorGroup.add(grid);

    scene.add(floorGroup);
}

/* 2. KISTE */
function createCrate() {
    partyBoxGroup = new THREE.Group();

    const boxGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    const boxMat = new THREE.MeshStandardMaterial({
        color: 0x6e401f,
        roughness: 0.5
    });
    const mainBox = new THREE.Mesh(boxGeo, boxMat);
    partyBoxGroup.add(mainBox);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.3, metalness: 0.8 });
    const cornerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * 1.1, y * 1.1, z * 1.1);
                partyBoxGroup.add(corner);
            });
        });
    });

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a2b15, roughness: 0.6 });
    const diagGeo = new THREE.BoxGeometry(2.6, 0.25, 0.08);
    const diagPlank = new THREE.Mesh(diagGeo, frameMat);
    diagPlank.position.z = 1.12;
    diagPlank.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diagPlank);

    partyBoxGroup.position.set(2.4, -0.1, -0.2);
    partyBoxGroup.rotation.set(0.25, -0.65, 0.12);

    scene.add(partyBoxGroup);
}

/* 3. FENSTER & REGEN */
function createWindowAndRain() {
    const windowGroup = new THREE.Group();

    const frameGeo = new THREE.BoxGeometry(4.5, 3.2, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x121218, roughness: 0.8 });
    const windowFrame = new THREE.Mesh(frameGeo, frameMat);
    windowGroup.add(windowFrame);

    const barMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.8 });
    const vertBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.22), barMat);
    const horizBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.22), barMat);
    windowGroup.add(vertBar);
    windowGroup.add(horizBar);

    windowGroup.position.set(2.5, 2.8, -5);
    scene.add(windowGroup);

    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = 2.5 + (Math.random() - 0.5) * 6;
        rainPos[i + 1] = Math.random() * 5 + 1;
        rainPos[i + 2] = -5.5 + (Math.random() - 0.5) * 1.5;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    if (partyBoxGroup) {
        partyBoxGroup.position.y = -0.1 + Math.sin(time * 1.5) * 0.05;
        partyBoxGroup.rotation.y = -0.65 + Math.sin(time * 0.8) * 0.03;
    }

    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.16;
            if (positions[i] < 0) {
                positions[i] = 5.5;
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (Math.random() > 0.985) {
        lightningLight.intensity = 100 + Math.random() * 120;
    } else {
        lightningLight.intensity *= 0.85;
    }

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
