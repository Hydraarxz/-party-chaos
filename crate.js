import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function createUltraDetailedCrate() {
    const partyBoxGroup = new THREE.Group();
    const w = 2.2, h = 2.2, d = 2.2;

    // Contact Shadow auf dem Boden
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.88 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(1.9, -1.192, -0.2);

    // Textur für Holzplanken generieren
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

    // Materialien
    const woodPlankMat = new THREE.MeshStandardMaterial({ map: crateWoodTex, color: 0x6e401f, roughness: 0.55 });
    const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x3d2210, roughness: 0.65 });
    const reinforcedMetalMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.3, metalness: 0.85 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.2, metalness: 0.95 });

    // Dunkler Kern
    const coreGeo = new THREE.BoxGeometry(w - 0.08, h - 0.08, d - 0.08);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x120a05, roughness: 0.95 });
    partyBoxGroup.add(new THREE.Mesh(coreGeo, coreMat));

    // Holzplanken
    const plankCount = 5;
    const pHeight = (h - 0.1) / plankCount;

    for (let i = 0; i < plankCount; i++) {
        const yPos = -h / 2 + pHeight / 2 + i * pHeight + 0.05;

        const fPlank = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, pHeight - 0.03, 0.06), woodPlankMat);
        fPlank.position.set(0, yPos, d / 2);
        fPlank.castShadow = true;
        fPlank.receiveShadow = true;
        partyBoxGroup.add(fPlank);

        const bPlank = fPlank.clone();
        bPlank.position.z = -d / 2;
        partyBoxGroup.add(bPlank);

        const lPlank = new THREE.Mesh(new THREE.BoxGeometry(0.06, pHeight - 0.03, d - 0.1), woodPlankMat);
        lPlank.position.set(-w / 2, yPos, 0);
        lPlank.castShadow = true;
        lPlank.receiveShadow = true;
        partyBoxGroup.add(lPlank);

        const rPlank = lPlank.clone();
        rPlank.position.x = w / 2;
        partyBoxGroup.add(rPlank);
    }

    // Diagonale Holzleisten
    const diagGeo = new THREE.BoxGeometry(w * 1.2, 0.18, 0.08);
    const diag1 = new THREE.Mesh(diagGeo, darkFrameMat);
    diag1.position.z = d / 2 + 0.03;
    diag1.rotation.z = Math.PI / 4;
    partyBoxGroup.add(diag1);

    const diag2 = new THREE.Mesh(diagGeo, darkFrameMat);
    diag2.position.z = d / 2 + 0.03;
    diag2.rotation.z = -Math.PI / 4;
    partyBoxGroup.add(diag2);

    // Metallecken & Nieten
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

    // Metallbeschlag
    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.05), reinforcedMetalMat);
    lockPlate.position.set(0, 0.1, d / 2 + 0.07);
    partyBoxGroup.add(lockPlate);

    partyBoxGroup.position.set(1.9, -0.09, -0.2);
    partyBoxGroup.rotation.set(0, -0.42, 0);

    return { partyBoxGroup, shadowMesh };
}
