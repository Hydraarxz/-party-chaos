import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let particleSystem;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608); // Sehr dunkles, edles Grau-Schwarz
    scene.fog = new THREE.FogExp2(0x060608, 0.03);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Schwebende Staub- / Licht-Partikel
    createDustParticles();

    // Sanftes, farbiges Umgebungslicht (Rechts im Hintergrund)
    const backLight = new THREE.PointLight(0xff0055, 3, 20);
    backLight.position.set(5, -2, 2);
    scene.add(backLight);

    const blueLight = new THREE.PointLight(0x00f2ff, 2, 20);
    blueLight.position.set(-5, 4, 1);
    scene.add(blueLight);

    window.addEventListener("resize", resize);
}

function createDustParticles() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 18;
        positions[i + 1] = (Math.random() - 0.5) * 12;
        positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.04,
        transparent: true,
        opacity: 0.3
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.0005;

    // Sehr dezente Partikel-Rotation
    if (particleSystem) {
        particleSystem.rotation.y = time * 0.2;
        particleSystem.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
