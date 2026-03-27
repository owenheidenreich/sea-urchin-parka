/**
 * GownBody.js — Fitted column gown with V-neckline shoulder straps.
 * Silhouette: V-neck bodice, cinched waist, body-hugging through hips/thighs,
 * gentle flare at floor. Inspired by red-carpet column/mermaid gowns.
 * LatheGeometry revolved around Y, Z-scaled for elliptical torso.
 */
import * as THREE from 'three';
import { BODY_COLOR } from '../utils/themes.js';

export function buildGownBody({
  bodiceHeight = 16, skirtFlare = 1.0, slitHeight = -10, slitWidth = 5,
  waistWidth = 10.8, bustWidth = 12.5, hipWidth = 12.2, hemHeight = -32,
} = {}) {
  const group = new THREE.Group();
  group.name = 'gownBody';

  // Column/mermaid silhouette — key radii driven by sliders
  const hemR = 15.0 * skirtFlare;
  const profileCurve = new THREE.SplineCurve([
    new THREE.Vector2(hemR,                    hemHeight),       // hem
    new THREE.Vector2(hemR * 0.9,              hemHeight + 2),   // just above floor
    new THREE.Vector2(hemR * 0.73,             hemHeight + 6),   // lower legs
    new THREE.Vector2(waistWidth * 0.93,       -20),             // mid-calf
    new THREE.Vector2(waistWidth * 0.97,       -14),             // knee area
    new THREE.Vector2(hipWidth * 0.94,         -8),              // upper thigh
    new THREE.Vector2(hipWidth,                -4),              // hip
    new THREE.Vector2(waistWidth,               0),              // waist
    new THREE.Vector2(bustWidth * 0.92,         4),              // lower bust
    new THREE.Vector2(bustWidth,                8),              // bust
    new THREE.Vector2(bustWidth * 1.02,        11),              // upper bust peak
    new THREE.Vector2(bustWidth * 0.88,        14),              // V-neckline narrows
    new THREE.Vector2(bustWidth * 0.64,        bodiceHeight),    // shoulder strap width
  ]);

  const points = profileCurve.getPoints(80);
  const geo = new THREE.LatheGeometry(points, 72);

  // Flatten front-to-back for realistic torso proportions
  geo.scale(1, 1, 0.78);

  // Cut V-neckline: remove front-center triangles above bust line
  // Also cut front slit below slitHeight
  const posAttr = geo.attributes.position;
  const index = geo.index;

  if (index) {
    const indices = Array.from(index.array);
    const kept = [];

    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i], i1 = indices[i + 1], i2 = indices[i + 2];

      // Check slit zone
      let allInSlit = true;
      for (const vi of [i0, i1, i2]) {
        const x = posAttr.getX(vi);
        const y = posAttr.getY(vi);
        const z = posAttr.getZ(vi);
        if (!(z > 0 && Math.abs(x) < slitWidth && y < slitHeight)) {
          allInSlit = false;
          break;
        }
      }
      if (allInSlit) continue;

      // V-neckline cut: remove front-center triangles above bust (y > 8)
      // The V narrows as it goes up, creating V shape
      let allInV = true;
      for (const vi of [i0, i1, i2]) {
        const x = posAttr.getX(vi);
        const y = posAttr.getY(vi);
        const z = posAttr.getZ(vi);
        // V-shape: width decreases linearly from bust (y=8) to neckline (y=bodiceHeight)
        if (y > 8 && z > 0) {
          const t = (y - 8) / (bodiceHeight - 8); // 0 at bust, 1 at top
          const vWidth = 12.0 * (1 - t * 0.85);  // narrows to ~15% at top
          if (Math.abs(x) < vWidth * 0.3) {
            // inside V-cut zone
          } else {
            allInV = false;
            break;
          }
        } else {
          allInV = false;
          break;
        }
      }
      if (allInV) continue;

      kept.push(i0, i1, i2);
    }

    geo.setIndex(kept);
  }

  geo.computeVertexNormals();

  // ── Add fabric drape folds to skirt region ──
  addDrapeFolds(geo, bodiceHeight);

  // Thin silk/satin — smooth, catches light, slightly see-through
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a4e,
    roughness: 0.12,
    metalness: 0.05,
    sheen: 1.0,
    sheenRoughness: 0.1,
    sheenColor: new THREE.Color(0x8888cc),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.78,
    transmission: 0.25,
    thickness: 0.15,
    ior: 1.5,
    iridescence: 0.6,
    iridescenceIOR: 1.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.5,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0x6666aa),
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'gownBodyMesh';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // ── Sheer overlay layer — thin second skin for layered fabric look ──
  const overlayGeo = geo.clone();
  // Scale overlay slightly outward for layering gap
  const overlayPosAttr = overlayGeo.attributes.position;
  const overlayNormAttr = overlayGeo.attributes.normal;
  for (let i = 0; i < overlayPosAttr.count; i++) {
    const nx = overlayNormAttr.getX(i);
    const ny = overlayNormAttr.getY(i);
    const nz = overlayNormAttr.getZ(i);
    overlayPosAttr.setX(i, overlayPosAttr.getX(i) + nx * 0.35);
    overlayPosAttr.setY(i, overlayPosAttr.getY(i) + ny * 0.35);
    overlayPosAttr.setZ(i, overlayPosAttr.getZ(i) + nz * 0.35);
  }
  overlayPosAttr.needsUpdate = true;

  const overlayMat = new THREE.MeshPhysicalMaterial({
    color: 0x4444aa,
    roughness: 0.08,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.22,
    transmission: 0.6,
    thickness: 0.05,
    ior: 1.33,
    iridescence: 0.7,
    iridescenceIOR: 1.4,
    depthWrite: false,
  });

  const overlay = new THREE.Mesh(overlayGeo, overlayMat);
  overlay.name = 'gownOverlay';
  overlay.renderOrder = 1;
  group.add(overlay);

  // ── Shoulder straps (thin delicate fabric) ──
  const strapMat = new THREE.MeshPhysicalMaterial({
    color: BODY_COLOR,
    roughness: 0.2,
    metalness: 0.0,
    sheen: 1.0,
    sheenRoughness: 0.2,
    sheenColor: new THREE.Color(0x4a4a6e),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    transmission: 0.06,
    thickness: 0.2,
    ior: 1.45,
    iridescence: 0.2,
    iridescenceIOR: 1.3,
  });

  // Left strap: from front-left bust, up over left shoulder
  const leftStrapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5, 10, 8),     // front bust, left of V
    new THREE.Vector3(-7, 13, 6),     // upper chest
    new THREE.Vector3(-8, bodiceHeight, 3),  // shoulder top
    new THREE.Vector3(-7, bodiceHeight - 1, -2),  // over shoulder to back
  ]);
  const leftStrapGeo = new THREE.TubeGeometry(leftStrapCurve, 16, 1.0, 8, false);
  const leftStrap = new THREE.Mesh(leftStrapGeo, strapMat);
  leftStrap.name = 'leftStrap';
  group.add(leftStrap);

  // Right strap
  const rightStrapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5, 10, 8),
    new THREE.Vector3(7, 13, 6),
    new THREE.Vector3(8, bodiceHeight, 3),
    new THREE.Vector3(7, bodiceHeight - 1, -2),
  ]);
  const rightStrapGeo = new THREE.TubeGeometry(rightStrapCurve, 16, 1.0, 8, false);
  const rightStrap = new THREE.Mesh(rightStrapGeo, strapMat);
  rightStrap.name = 'rightStrap';
  group.add(rightStrap);

  // ── Waist gather/cinch detail ──
  // Radiating gather lines from center waist
  const gatherMat = new THREE.MeshPhysicalMaterial({
    color: 0x111122, roughness: 0.2, metalness: 0.05,
    transparent: true, opacity: 0.6,
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI - Math.PI / 2; // fan from center
    const gatherCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1, 10),  // center front waist
      new THREE.Vector3(Math.sin(angle) * 6, -1 + Math.cos(angle) * 4, 9.5),
    ]);
    const gatherGeo = new THREE.TubeGeometry(gatherCurve, 8, 0.08, 4, false);
    const gather = new THREE.Mesh(gatherGeo, gatherMat);
    group.add(gather);
  }

  return group;
}

/** Displace vertices below waist to simulate gravity drape folds in fabric */
function addDrapeFolds(geo, bodiceHeight) {
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // Only affect skirt region (below waist, y < 0)
    if (y >= 0) continue;

    // How far below waist — stronger folds lower down
    const depth = Math.abs(y) / 32; // 0 at waist, 1 at hem

    // Radial angle for fold frequency
    const angle = Math.atan2(z, x);

    // Sinusoidal folds — 10 folds around the circumference
    const foldFreq = 10;
    const foldAmp = 0.8 * depth * depth; // stronger near hem
    const fold = Math.sin(angle * foldFreq + y * 0.15) * foldAmp;

    // Displace along radial direction (in/out)
    const r = Math.sqrt(x * x + z * z);
    if (r < 0.01) continue;
    const nx = x / r;
    const nz = z / r;

    posAttr.setX(i, x + nx * fold);
    posAttr.setZ(i, z + nz * fold);

    // Gravity sag — fabric hangs lower between fold peaks
    const sag = Math.cos(angle * foldFreq + y * 0.15) * 0.3 * depth;
    posAttr.setY(i, y - Math.abs(sag));
  }
  posAttr.needsUpdate = true;
}
