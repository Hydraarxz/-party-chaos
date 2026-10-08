import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

let scene, camera, renderer;
let partyBoxGroup, rainParticles, lightningLight;
let mouseX = 0, mouseY = 0;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205);
    scene.fog = new THREE.FogExp2(0x020205, 0.04);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 8.2);

    const canvas = document.getElementById("stage3d");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    setupLighting();
    createProceduralRealisticFloor();
    createGroundedDetailedCrate();
    createAtmosphericWindowAndForest();

    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", resize);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x182030, 0.8);
    scene.add(ambientLight);

    const windowMoonLight = new THREE.SpotLight(0x4a77aa, 120, 15, Math.PI / 3, 0.5);
    windowMoonLight.position.set(1.8, 2.2, -4.3);
    windowMoonLight.target.position.set(0, -1.0, 1.0);
    scene.add(windowMoonLight);
    scene.add(windowMoonLight.target);

    const crateWarmLight = new THREE.SpotLight(0xcc7733, 35, 10, Math.PI / 4, 0.8);
    crateWarmLight.position.set(3.5, 2.5, 3.5);
    crateWarmLight.target.position.set(1.8, -0.2, -0.2);
    scene.add(crateWarmLight);
    scene.add(crateWarmLight.target);

    lightningLight = new THREE.PointLight(0x77aaff, 0, 40);
    lightningLight.position.set(1.8, 2.2, -5.5);
    scene.add(lightningLight);
}

/* 1. REALISTISCHER DIELENBODEN */
function createProceduralRealisticFloor() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22130b';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 700; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        const y = Math.random() * 512;
        const h = Math.random() * 2 + 1;
        ctx.fillRect(0, y, 512, h);
    }

    ctx.fillStyle = '#050201';
    for (let y = 0; y < 512; y += 64) {
        ctx.fillRect(0, y, 512, 5);
    }

    const generatedTexture = new THREE.CanvasTexture(canvas);
    generatedTexture.wrapS = THREE.RepeatWrapping;
    generatedTexture.wrapT = THREE.RepeatWrapping;
    generatedTexture.repeat.set(4, 6);

    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        map: generatedTexture,
        roughness: 0.45,
        metalness: 0.05
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;

    scene.add(floor);
}

/* 2. PLASTISCHE RESIDENT-EVIL STYLE KISTE */
function createGroundedDetailedCrate() {
    partyBoxGroup = new THREE.Group();
    const w = 2.2, h = 2.2, d = 2.2;

    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(1.9, -1.19, -0.2);
    scene.add(shadow);

    const coreGeo = new THREE.BoxGeometry(w - 0.08, h - 0.08, d - 0.08);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x150b06, roughness: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    partyBoxGroup.add(core);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4e2e17, roughness: 0.6 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x311c0e, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.3, metalness: 0.9 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.2, metalness: 0.95 });

    const plankCount = 4;
    const pHeight = (h - 0.1) / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        const fPlank = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, pHeight - 0.04, 0.06), woodMat);
        fPlank.position.set(0, yPos, d / 2);
        partyBoxGroup.add(fPlank);

        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);
    }

    const diagGeo = new THREE.BoxGeometry(w * 1.2, 0.18, 0.08);
    const diag1 = new THREE.Mesh(diagGeo, darkWoodMat);
    diag1.position.z = d / 2 + 0.03;
    diag1.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag1);

    const cornerGeo = new THREE.BoxGeometry(0.36, 0.36, 0.36);
    const boltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.06, 8);

    [-1, 1].forEach(x => {
        [-1, 1].forEach(y => {
            [-1, 1].forEach(z => {
                const corner = new THREE.Mesh(cornerGeo, metalMat);
                corner.position.set(x * (w / 2), y * (h / 2), z * (d / 2));
                partyBoxGroup.add(corner);

                const bolt = new THREE.Mesh(boltGeo, boltMat);
                bolt.position.set(x * (w / 2 + 0.02), y * (h / 2), z * (d / 2 + 0.02));
                bolt.rotation.x = Math.PI / 2;
                partyBoxGroup.add(bolt);
            });
        });
    });

    partyBoxGroup.position.set(1.9, -0.09, -0.2);
    partyBoxGroup.rotation.set(0, -0.42, 0);

    scene.add(partyBoxGroup);
}

/* 3. FENSTER MIT DÜSTEREM WALD UND NUKLEAR BEGRENZTEM REGEN */
function createAtmosphericWindowAndForest() {
    const windowGroup = new THREE.Group();

    const wWidth = 4.2;
    const wHeight = 3.2;

    // A) WALD-HINTERGRUND (SILHOUETTEN VON TANNEN)
    const forestCanvas = document.createElement('canvas');
    forestCanvas.width = 512;
    forestCanvas.height = 512;
    const fCtx = forestCanvas.getContext('2d');

    // Nachteule/Gewitter-Himmel
    const grad = fCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a1220');
    grad.addColorStop(1, '#020408');
    fCtx.fillStyle = grad;
    fCtx.fillRect(0, 0, 512, 512);

    // Tannenbäume im Hintergrund zeichnen
    function drawTree(x, y, scale, color) {
        fCtx.fillStyle = color;
        fCtx.beginPath();
        fCtx.moveTo(x, y - 180 * scale);
        fCtx.lineTo(x + 50 * scale, y - 90 * scale);
        fCtx.lineTo(x + 30 * scale, y - 90 * scale);
        fCtx.lineTo(x + 70 * scale, y);
        fCtx.lineTo(x - 70 * scale, y);
        fCtx.lineTo(x - 30 * scale, y - 90 * scale);
        fCtx.lineTo(x - 50 * scale, y - 90 * scale);
        fCtx.closePath();
        fCtx.fill();
    }

    // Entfernte Waldschichten
    for (let i = 0; i < 15; i++) {
        drawTree(Math.random() * 512, 400, 0.4 + Math.random() * 0.3, '#08121d');
    }
    // Vorderer dichter Wald
    for (let i = 0; i < 10; i++) {
        drawTree(i * 55 + Math.random() * 20, 512, 0.7 + Math.random() * 0.4, '#03070d');
    }

    const forestTexture = new THREE.CanvasTexture(forestCanvas);
    const forestGeo = new THREE.PlaneGeometry(wWidth, wHeight);
    const forestMat = new THREE.MeshBasicMaterial({ map: forestTexture });
    const forestPlane = new THREE.Mesh(forestGeo, forestMat);
    forestPlane.position.z = -0.15;
    windowGroup.add(forestPlane);

    // B) GLASSCHEIBE
    const glassGeo = new THREE.PlaneGeometry(wWidth, wHeight);
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x1c2b3d,
        roughness: 0.1,
        transparent: true,
        opacity: 0.5
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = 0.01;
    windowGroup.add(glass);

    // C) FENSTERRAHMEN UND SPROSSEN
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0c12, roughness: 0.8 });

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(wWidth + 0.4, 0.25, 0.3), frameMat);
    topFrame.position.y = wHeight / 2 + 0.1;
    const botFrame = topFrame.clone();
    botFrame.position.y = -(wHeight / 2 + 0.1);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.25, wHeight, 0.3), frameMat);
    leftFrame.position.x = -(wWidth / 2 + 0.1);
    const rightFrame = leftFrame.clone();
    rightFrame.position.x = wWidth / 2 + 0.1;

    windowGroup.add(topFrame, botFrame, leftFrame, rightFrame);

    [-1.2, 0, 1.2].forEach(x => {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, wHeight, 0.15), frameMat);
        vBar.position.set(x, 0, 0.05);
        windowGroup.add(vBar);
    });

    [-0.8, 0.8].forEach(y => {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(wWidth, 0.1, 0.15), frameMat);
        hBar.position.set(0, y, 0.05);
        windowGroup.add(hBar);
    });

    windowGroup.position.set(1.8, 2.2, -4.5);
    scene.add(windowGroup);

    // D) REGEN-PARTIKEL (EXAKT AUF DIE FENSTERFLÄCHE BEGRENZT!)
    const rainCount = 400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        // X-Bereich streng innerhalb des Fensters (1.8 +/- 1.95)
        rainPos[i] = 1.8 + (Math.random() - 0.5) * (wWidth - 0.3);
        // Y-Bereich innerhalb der Fensterhöhe
        rainPos[i + 1] = 2.2 + (Math.random() - 0.5) * (wHeight - 0.2);
        // Z-Bereich direkt hinter der Scheibe, vor dem Wald (-4.58)
        rainPos[i + 2] = -4.58;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.04,
        transparent: true,
        opacity: 0.8
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
}

function animate() {
    requestAnimationFrame(animate);

    // Regen-Animation exakt innerhalb des Fensterrahmens
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        const wWidth = 4.2;
        const wHeight = 3.2;

        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.18; // Fallgeschwindigkeit
            
            // Wenn der Tropfen unten aus dem Fenster fällt, oben wieder im Fenster einfügen
            if (positions[i] < 2.2 - (wHeight / 2)) {
                positions[i] = 2.2 + (wHeight / 2) - 0.1;
                positions[i - 1] = 1.8 + (Math.random() - 0.5) * (wWidth - 0.3);
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (Math.random() > 0.989) {
        lightningLight.intensity = 180 + Math.random() * 200;
    } else {
        lightningLight.intensity *= 0.80;
    }

    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.15 + 1.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.3, 0);

    renderer.render(scene, camera);
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.createGame = () => alert("🎮 Spiel wird erstellt...");
window.joinGame = () => alert("🚪 Lobby beitreten...");
