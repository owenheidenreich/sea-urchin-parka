/**
 * ParkaHood.js — Two-panel swept hood (realistic hoodie construction).
 *
 * The hood is built by sweeping a U-shaped cross-section along a center
 * seam curve that runs from the front neckline, over the crown, to the
 * back neckline. This mimics how a real hoodie is constructed from two
 * fabric panels sewn together at the center seam.
 */
import * as THREE from 'three';
import { HOOD_COLOR } from '../utils/themes.js';

/**
 * Build the hood mesh.
 * @param {number} depth — controls how tall/deep the hood is (default 14)
 */
export function buildParkaHood(depth = 14) {
  const group = new THREE.Group();
  group.name = 'parkaHood';

  // ── Center seam curve ──
  // Scaled ~25% smaller so hood fits snugly around the mannequin head.
  const crownY = 25 + depth * 0.75;
  const frontZ = 5.5;
  const backZ  = -6;

  const seamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 25,  frontZ),
    new THREE.Vector3(0, 30,  frontZ + 1),
    new THREE.Vector3(0, crownY, 0.5),
    new THREE.Vector3(0, crownY - 3, backZ + 1.5),
    new THREE.Vector3(0, 25, backZ),
  ]);

  // ── Sweep parameters ──
  const SEAM_STEPS    = 40;
  const PROFILE_STEPS = 24;

  const positions = [];
  const normals   = [];
  const uvs       = [];
  const indices   = [];

  let prevDown = null;

  for (let si = 0; si <= SEAM_STEPS; si++) {
    const t = si / SEAM_STEPS;
    const point   = seamCurve.getPointAt(t);
    const tangent = seamCurve.getTangentAt(t).normalize();

    const worldX = new THREE.Vector3(1, 0, 0);
    let right = worldX.clone().sub(tangent.clone().multiplyScalar(worldX.dot(tangent)));
    if (right.length() < 0.01) right.set(0, 0, 1);
    right.normalize();

    const down = new THREE.Vector3().crossVectors(right, tangent).normalize();

    if (prevDown) {
      if (down.dot(prevDown) < 0) down.negate();
    } else {
      if (down.z < 0 && down.y > 0) down.negate();
    }
    prevDown = down.clone();

    const profileWidth = hoodProfileWidth(t);
    const profileDepth = hoodProfileDepth(t);

    for (let pi = 0; pi <= PROFILE_STEPS; pi++) {
      const pa = (pi / PROFILE_STEPS) * Math.PI;
      const localRight = Math.cos(pa) * profileWidth;
      const localDown  = Math.sin(pa) * profileDepth;

      const wx = point.x + right.x * localRight + down.x * localDown;
      const wy = point.y + right.y * localRight + down.y * localDown;
      const wz = point.z + right.z * localRight + down.z * localDown;

      positions.push(wx, wy, wz);

      const nx = right.x * Math.cos(pa) + down.x * Math.sin(pa);
      const ny = right.y * Math.cos(pa) + down.y * Math.sin(pa);
      const nz = right.z * Math.cos(pa) + down.z * Math.sin(pa);
      const nm = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(nx / nm, ny / nm, nz / nm);

      uvs.push(t, pi / PROFILE_STEPS);
    }
  }

  // Build triangle indices for the U-shaped surface
  for (let si = 0; si < SEAM_STEPS; si++) {
    for (let pi = 0; pi < PROFILE_STEPS; pi++) {
      const a = si * (PROFILE_STEPS + 1) + pi;
      const b = a + 1;
      const c = a + (PROFILE_STEPS + 1);
      const d = c + 1;
      indices.push(a, c, b,  b, c, d);
    }
  }

  // ── Close the hood tunnel ──
  // pi=0 edge → +X local → +Z world (FRONT)
  // pi=PROFILE_STEPS edge → -X local → -Z world (BACK)
  // Use zip-strip: pair vertices from both ends of the seam, meeting at crown.

  // -- Back closure (fully sealed) --
  zipClosure(indices, PROFILE_STEPS, PROFILE_STEPS, 0, SEAM_STEPS);

  // -- Front closure (sealed ABOVE face opening) --
  // Leave t=0 to t=0.40 open as the face opening; close t=0.40 to t=1.0
  const FACE_OPEN_END = Math.round(SEAM_STEPS * 0.40);
  zipClosure(indices, PROFILE_STEPS, 0, FACE_OPEN_END, SEAM_STEPS);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const mat = new THREE.MeshPhysicalMaterial({
    color: HOOD_COLOR,
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0x2a2a3e),
    side: THREE.DoubleSide,
  });

  const hoodMesh = new THREE.Mesh(geo, mat);
  hoodMesh.name = 'hoodSurface';
  hoodMesh.castShadow = true;
  hoodMesh.receiveShadow = true;
  group.add(hoodMesh);

  // ── Face opening rim ──
  const rimGeo = buildFaceRim(seamCurve, SEAM_STEPS);
  if (rimGeo) {
    const rimMat = new THREE.MeshPhysicalMaterial({
      color: 0x222233, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.name = 'hoodRim';
    rimMesh.castShadow = true;
    group.add(rimMesh);
  }

  // ── Center seam ridge ──
  const seamGeo = new THREE.TubeGeometry(seamCurve, 30, 0.15, 6, false);
  const seamMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.7 });
  const seamMesh = new THREE.Mesh(seamGeo, seamMat);
  seamMesh.name = 'hoodSeam';
  group.add(seamMesh);

  group.rotation.y = -Math.PI / 2;

  return group;
}

// ── Zip-strip closure ──
// Zips a closure surface by pairing edge vertices from both ends toward the center.
// profileEdge: 0 (front/+X) or PROFILE_STEPS (back/-X)
// loSi / hiSi: seam step range to close
function zipClosure(indices, PROFILE_STEPS, profileEdge, loSi, hiSi) {
  function vi(si) { return si * (PROFILE_STEPS + 1) + profileEdge; }

  let lo = loSi;
  let hi = hiSi;

  while (lo + 1 < hi) {
    indices.push(vi(lo), vi(lo + 1), vi(hi));
    lo++;
    if (lo + 1 < hi) {
      indices.push(vi(hi), vi(lo), vi(hi - 1));
      hi--;
    }
  }
}

// ── Profile functions (scaled 75% for snugger fit) ──
function hoodProfileWidth(t) {
  let w;
  if (t < 0.15)      w = 10.0 * (t / 0.15);
  else if (t < 0.35) w = 10.0 + (t - 0.15) * 5;
  else if (t < 0.55) w = 11.0 - (t - 0.35) * 15;
  else if (t < 0.75) w = 8.0 - (t - 0.55) * 5;
  else                w = 7.0 * (1 - (t - 0.75) / 0.25);
  return w * 0.75;
}

function hoodProfileDepth(t) {
  let d;
  if (t < 0.15)      d = 8.0 * (t / 0.15);
  else if (t < 0.35) d = 8.0 + (t - 0.15) * 10;
  else if (t < 0.55) d = 10.0;
  else if (t < 0.75) d = 10.0 - (t - 0.55) * 8;
  else                d = 8.4 * (1 - (t - 0.75) / 0.25);
  return d * 0.75;
}

// ── Face opening rim ──
function buildFaceRim(seamCurve, seamSteps) {
  const rimPoints = [];
  let prevDown = null;

  for (let si = 0; si <= Math.round(seamSteps * 0.35); si++) {
    const t = si / seamSteps;
    const point   = seamCurve.getPointAt(Math.min(t, 0.999));
    const tangent = seamCurve.getTangentAt(Math.min(t, 0.999)).normalize();

    const worldX = new THREE.Vector3(1, 0, 0);
    let right = worldX.clone().sub(tangent.clone().multiplyScalar(worldX.dot(tangent)));
    if (right.length() < 0.01) right.set(0, 0, 1);
    right.normalize();

    const down = new THREE.Vector3().crossVectors(right, tangent).normalize();
    if (prevDown) {
      if (down.dot(prevDown) < 0) down.negate();
    } else {
      if (down.z < 0 && down.y > 0) down.negate();
    }
    prevDown = down.clone();

    const w = hoodProfileWidth(t);

    rimPoints.unshift(new THREE.Vector3(
      point.x - right.x * w,
      point.y - right.y * w,
      point.z - right.z * w,
    ));

    rimPoints.push(new THREE.Vector3(
      point.x + right.x * w,
      point.y + right.y * w,
      point.z + right.z * w,
    ));
  }

  if (rimPoints.length < 4) return null;
  const curve = new THREE.CatmullRomCurve3(rimPoints);
  return new THREE.TubeGeometry(curve, 40, 0.3, 8, false);
}
