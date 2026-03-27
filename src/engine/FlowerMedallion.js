/**
 * FlowerMedallion.js — 3D daisy medallion with sculptural dizzy face.
 * Detachable chest medallion: ~21 thin white daisy petals radiating
 * from a golden-yellow center disc. Shiny semi-transparent face
 * (#816E48) with raised brow ridges, cheekbones, and chin.
 * Red wavy-line eyes and open circle mouth.
 */
import * as THREE from 'three';

export function buildFlowerMedallion() {
  const group = new THREE.Group();
  group.name = 'flowerMedallion';

  const PETAL_COUNT = 21;
  const PETAL_LENGTH = 4.5;
  const PETAL_WIDTH_HALF = 0.55;

  // ── Materials ──
  // Daisy petal: white, slight sheen
  const petalMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5f0e8,
    metalness: 0.05,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  // Petal border: subtle warm edge
  const petalBorderMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8dcc8,
    metalness: 0.1,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  // Yellow center (like daisy pistil)
  const centerMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8b830,
    metalness: 0.6,
    roughness: 0.25,
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4a830,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });

  const redMat = new THREE.MeshBasicMaterial({ color: 0xcc1111 });

  // Shiny face — metallic clearcoat with low-opacity #816E48
  const faceMat = new THREE.MeshPhysicalMaterial({
    color: 0x816E48,
    transparent: true,
    opacity: 0.45,
    roughness: 0.08,
    metalness: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    side: THREE.DoubleSide,
  });

  // ── Daisy petal shape (narrow, rounded tip) ──
  function makeDaisyPetal(w, len) {
    const s = new THREE.Shape();
    // Start at narrow base
    s.moveTo(0, 0.5);
    // Right side — slight bulge in middle, rounded tip
    s.bezierCurveTo(w * 0.6, len * 0.15, w, len * 0.45, w * 0.85, len * 0.75);
    // Rounded tip
    s.bezierCurveTo(w * 0.6, len * 0.95, 0, len + 0.15, 0, len);
    // Back to center at tip
    s.bezierCurveTo(0, len + 0.15, -w * 0.6, len * 0.95, -w * 0.85, len * 0.75);
    // Left side back to base
    s.bezierCurveTo(-w, len * 0.45, -w * 0.6, len * 0.15, 0, 0.5);
    return s;
  }

  const petalGeo = new THREE.ExtrudeGeometry(
    makeDaisyPetal(PETAL_WIDTH_HALF, PETAL_LENGTH),
    { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }
  );

  const borderGeo = new THREE.ExtrudeGeometry(
    makeDaisyPetal(PETAL_WIDTH_HALF + 0.1, PETAL_LENGTH + 0.15),
    { depth: 0.1, bevelEnabled: false }
  );

  // Alternate petal lengths slightly for natural look
  for (let i = 0; i < PETAL_COUNT; i++) {
    const angle = (i / PETAL_COUNT) * Math.PI * 2;
    const petalGroup = new THREE.Group();

    const border = new THREE.Mesh(borderGeo, petalBorderMat);
    border.position.z = -0.05;
    petalGroup.add(border);

    const petal = new THREE.Mesh(petalGeo, petalMat);
    petalGroup.add(petal);

    // Slight random tilt for natural daisy look
    const tiltAngle = (Math.sin(i * 2.7) * 0.08);
    petalGroup.rotation.z = angle;
    petalGroup.rotation.x = tiltAngle;

    // Alternate petal scale slightly
    const scaleFactor = 0.92 + Math.abs(Math.sin(i * 1.9)) * 0.12;
    petalGroup.scale.set(scaleFactor, scaleFactor, 1);

    group.add(petalGroup);
  }

  // ── Center disc (yellow, bumpy like daisy center) ──
  const centerDiscGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.35, 32);
  const centerDisc = new THREE.Mesh(centerDiscGeo, centerMat);
  centerDisc.rotation.x = Math.PI / 2;
  centerDisc.position.z = 0.2;
  group.add(centerDisc);

  // Tiny bumps on center to simulate daisy florets
  const bumpGeo = new THREE.SphereGeometry(0.1, 6, 6);
  for (let r = 0; r < 3; r++) {
    const radius = 0.35 + r * 0.35;
    const count = 6 + r * 4;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r * 0.3;
      const bump = new THREE.Mesh(bumpGeo, centerMat);
      bump.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0.42);
      group.add(bump);
    }
  }

  // Gold rim ring around center
  const ringGeo = new THREE.TorusGeometry(1.4, 0.12, 10, 32);
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.position.z = 0.35;
  group.add(ring);

  // ── Sculptural face (shiny) ──
  // Base face sphere (slightly squashed) — gives overall dome shape
  const faceBaseGeo = new THREE.SphereGeometry(1.1, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const faceBase = new THREE.Mesh(faceBaseGeo, faceMat);
  faceBase.scale.set(1, 1, 0.35);
  faceBase.position.z = 0.3;
  group.add(faceBase);

  // Brow ridge — left
  const browGeo = new THREE.SphereGeometry(0.32, 12, 8);
  const leftBrow = new THREE.Mesh(browGeo, faceMat);
  leftBrow.scale.set(1.8, 0.7, 0.6);
  leftBrow.position.set(-0.4, 0.55, 0.58);
  group.add(leftBrow);

  // Brow ridge — right
  const rightBrow = new THREE.Mesh(browGeo, faceMat);
  rightBrow.scale.set(1.8, 0.7, 0.6);
  rightBrow.position.set(0.4, 0.55, 0.58);
  group.add(rightBrow);

  // Nose bridge
  const noseGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const nose = new THREE.Mesh(noseGeo, faceMat);
  nose.scale.set(0.6, 2.0, 0.8);
  nose.position.set(0, 0.05, 0.62);
  group.add(nose);

  // Cheekbones — left
  const cheekGeo = new THREE.SphereGeometry(0.25, 10, 8);
  const leftCheek = new THREE.Mesh(cheekGeo, faceMat);
  leftCheek.scale.set(1.2, 0.8, 0.5);
  leftCheek.position.set(-0.55, -0.05, 0.55);
  group.add(leftCheek);

  // Cheekbones — right
  const rightCheek = new THREE.Mesh(cheekGeo, faceMat);
  rightCheek.scale.set(1.2, 0.8, 0.5);
  rightCheek.position.set(0.55, -0.05, 0.55);
  group.add(rightCheek);

  // Chin/mouth mound
  const chinGeo = new THREE.SphereGeometry(0.3, 10, 8);
  const chin = new THREE.Mesh(chinGeo, faceMat);
  chin.scale.set(1.3, 1.0, 0.5);
  chin.position.set(0, -0.38, 0.55);
  group.add(chin);

  // ── Wavy eyes (red) ──
  group.add(makeWavyEye(-0.4, 0.32, 0.55, 0.13, 3, redMat));
  group.add(makeWavyEye( 0.4, 0.32, 0.55, 0.13, 3, redMat));

  // ── Open circle mouth (red) ──
  const mouthGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 18);
  const mouth = new THREE.Mesh(mouthGeo, redMat);
  mouth.position.set(0, -0.38, 0.65);
  group.add(mouth);

  // ── Position on chest front ──
  group.position.set(0, 6, 9.8);

  return group;
}

function makeWavyEye(centerX, centerY, width, amplitude, waves, mat) {
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(new THREE.Vector3(
      centerX + (t - 0.5) * width,
      centerY + Math.sin(t * Math.PI * waves) * amplitude,
      0.66,
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 24, 0.04, 6, false);
  return new THREE.Mesh(geo, mat);
}
