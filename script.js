import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("stage3d");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshStandardMaterial({
    color: 0xff00ff
});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

const light = new THREE.PointLight(0xffffff, 100);
light.position.set(3, 3, 5);

scene.add(light);

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
