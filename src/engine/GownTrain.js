/**
 * GownTrain.js — Long flowing train trailing from the back of the gown.
 * Sweeps from the back hem outward along the floor, tapering elegantly.
 * Matches the column gown silhouette — not too wide, gracefully flowing.
 */
import * as THREE from 'three';
import { BODY_COLOR } from '../utils/themes.js';

export function buildGownTrain({ trainLength = 25, trainWidth = 1.0, skirtFlare = 1.0 } = {}) {
  const group = new THREE.Group();
  group.name = 'gownTrain';

  const hemRadius = 15.0 * skirtFlare;   // match GownBody hem radius (column silhouette)
  const zScale = 0.78;
  const floorY = -31.9;

  // Train covers just the back portion of the hem (~120° arc, not full 180°)
  const arcSteps = 24;
  const lengthSteps = 24;

  const vertCount = (arcSteps + 1) * (lengthSteps + 1);
  const positions = new Float32Array(vertCount * 3);
  const normals   = new Float32Array(vertCount * 3);
  const uvs       = new Float32Array(vertCount * 2);

  for (let li = 0; li <= lengthSteps; li++) {
    const v = li / lengthSteps;
    const dist = v * trainLength;

    // Taper: starts at hem width, narrows to a point
    const taper = trainWidth * (1.0 - v * 0.6);

    // The train also fans out slightly as it extends, creating that flowing look
    const fanAngle = 1.0 + v * 0.3; // arc widens slightly

    for (let ai = 0; ai <= arcSteps; ai++) {
      const u = ai / arcSteps;
      // Arc centered on back (-Z side): from ~210° to ~330° (120° arc)
      const arcSpan = (Math.PI / 3) * fanAngle; // ~60° each side of center-back
      const angle = Math.PI + (u - 0.5) * 2 * arcSpan;

      const idx = li * (arcSteps + 1) + ai;

      const hemX = Math.cos(angle) * hemRadius * taper;
      const hemZ = Math.sin(angle) * hemRadius * zScale * taper;

      // Smooth blend from skirt height to floor
      const blendUp = Math.pow(Math.max(0, 1 - v * 3), 2);
      const yPos = floorY + blendUp * 2;

      positions[idx * 3]     = hemX;
      positions[idx * 3 + 1] = yPos;
      positions[idx * 3 + 2] = hemZ - dist;

      normals[idx * 3]     = 0;
      normals[idx * 3 + 1] = 1;
      normals[idx * 3 + 2] = 0;

      uvs[idx * 2]     = u;
      uvs[idx * 2 + 1] = v;
    }
  }

  const indices = [];
  for (let li = 0; li < lengthSteps; li++) {
    for (let ai = 0; ai < arcSteps; ai++) {
      const a = li * (arcSteps + 1) + ai;
      const b = a + 1;
      const c = a + (arcSteps + 1);
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Add ripple/drape folds to train fabric
  addTrainDrape(geo, trainLength);

  // Thin flowing train fabric — silk pooling on floor
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a4e,
    roughness: 0.1,
    metalness: 0.05,
    sheen: 1.0,
    sheenRoughness: 0.1,
    sheenColor: new THREE.Color(0x8888cc),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
    transmission: 0.3,
    thickness: 0.1,
    ior: 1.5,
    iridescence: 0.6,
    iridescenceIOR: 1.4,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0x6666aa),
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'gownTrainMesh';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Sheer overlay layer for train — second skin effect
  const overlayGeo = geo.clone();
  const oPos = overlayGeo.attributes.position;
  const oNorm = overlayGeo.attributes.normal;
  for (let i = 0; i < oPos.count; i++) {
    oPos.setX(i, oPos.getX(i) + oNorm.getX(i) * 0.25);
    oPos.setY(i, oPos.getY(i) + oNorm.getY(i) * 0.25 + 0.1);
    oPos.setZ(i, oPos.getZ(i) + oNorm.getZ(i) * 0.25);
  }
  oPos.needsUpdate = true;

  const overlayMat = new THREE.MeshPhysicalMaterial({
    color: 0x4444aa,
    roughness: 0.06,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
    transmission: 0.65,
    thickness: 0.04,
    ior: 1.33,
    iridescence: 0.7,
    iridescenceIOR: 1.4,
    depthWrite: false,
  });

  const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
  overlayMesh.name = 'trainOverlay';
  overlayMesh.renderOrder = 1;
  group.add(overlayMesh);

  return group;
}

/** Ripple/fold displacement on train fabric for organic draping */
function addTrainDrape(geo, trainLength) {
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // Lateral ripples across the train width
    const ripple = Math.sin(x * 0.8 + z * 0.3) * 0.3;
    // Longitudinal waves along train length
    const wave = Math.sin(z * 0.25) * 0.2;

    posAttr.setY(i, y + ripple + wave);
  }
  posAttr.needsUpdate = true;
}
