import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let speakers = [];
let spotLights = [];
let lasers = [];

let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040208);
    scene.fog = new THREE.FogExp2(0x0c0518, 0.04);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3, 11);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0x331144, 1.5);
    scene.add(ambient);

    createFloor();
    createStage();
    createSpeakers();
    createLighting();
    createLasers();

    // Interaktive Mausbewegung
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function createFloor() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x08080d, roughness: 0.2, metalness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}

function createStage() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x151020, roughness: 0.4 });
    const stage = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 6), mat);
    stage.position.set(0, 0.25, 0);
    scene.add(stage);
}

function createSpeakers() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.3 });
    
    [-5.2, 5.2].forEach(x => {
        const spk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.2, 1.5), mat);
        spk.position.set(x, 2.3, 0);
        speakers.push(spk);
        scene.add(spk);
    });
}

function createLighting() {
    const colors = [0xff0055, 0x00f2ff, 0xffe600, 0xaa00ff];
    
    colors.forEach((color, i) => {
        const spot = new THREE.SpotLight(color, 150, 25, Math.PI / 7, 0.5);
        spot.position.set((i - 1.5) * 3.5, 7, 1);
        spot.target.position.set((i - 1.5) * 2, 0, 0);
        scene.add(spot);
        scene.add(spot.target);
        spotLights.push(spot);
    });
}

/* Rotierende Disko-Laserstrahlen */
function createLasers() {
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.7 });
    
    for(let i = 0; i < 4; i++) {
        const geom = new THREE.CylinderGeometry(0.02, 0.02, 15);
        const laser = new THREE.Mesh(geom, laserMat);
        laser.position.set((i - 1.5) * 3, 6.5, -1);
        laser.rotation.z = Math.PI / 4 * (i % 2 === 0 ? 1 : -1);
        lasers.push(laser);
        scene.add(laser);
    }
}

function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.002;

    // Kamera folgt sanft der Maus
    camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 + 3 - camera.position.y) * 0.05;
    camera.lookAt(0, 2.2, 0);

    // Laser-Bewegung
    lasers.forEach((l, i) => {
        l.rotation.x = Math.sin(t + i) * 0.5;
        l.rotation.z = Math.cos(t * 0.8 + i) * 0.6;
    });

    // Scheinwerfer kreisen & flackern
    spotLights.forEach((spot, i) => {
        spot.target.position.x = Math.sin(t * 1.5 + i) * 3;
        spot.intensity = 120 + Math.sin(t * 10 + i) * 30;
    });

    // Lautsprecher-Bass-Pumpen
    speakers.forEach((s, i) => {
        const scale = 1 + Math.sin(t * 12 + i) * 0.03;
        s.scale.set(scale, scale, scale);
    });

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel erstellen!");
window.joinGame = () => alert("🚪 Spiel beitreten!");
