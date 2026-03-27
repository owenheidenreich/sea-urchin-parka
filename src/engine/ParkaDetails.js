/**
 * ParkaDetails.js — Construction details that make it look like a real garment.
 * Seam lines, collar band, cuffs, hem, zipper line.
 */
import * as THREE from 'three';
import { DETAIL_COLOR } from '../utils/themes.js';

const detailMat = new THREE.MeshStandardMaterial({
  color: DETAIL_COLOR, roughness: 0.6, metalness: 0.1,
});

export function buildParkaDetails() {
  const group = new THREE.Group();
  group.name = 'parkaDetails';

  // ── Collar band ──
  const collarGeo = new THREE.TorusGeometry(10.2 * 0.89, 0.6, 8, 48);
  const collar = new THREE.Mesh(collarGeo, detailMat);
  collar.position.y = 25;
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 0.78, 1); // match body elliptical shape
  collar.name = 'collar';
  group.add(collar);

  // ── Hem band ──
  const hemGeo = new THREE.TorusGeometry(14.5 * 0.89, 0.5, 8, 48);
  const hem = new THREE.Mesh(hemGeo, detailMat);
  hem.position.y = -28;
  hem.rotation.x = Math.PI / 2;
  hem.scale.set(1, 0.78, 1);
  hem.name = 'hem';
  group.add(hem);

  // ── Front zipper line ──
  // Vertical tube from collar down to hem along front center (+Z face)
  const zipperPoints = [];
  for (let y = -28; y <= 25; y += 1) {
    // Body radius at this height (approximate from LatheGeometry profile)
    const r = bodyRadiusAtY(y);
    zipperPoints.push(new THREE.Vector3(0, y, r * 0.78)); // Z-scaled
  }
  if (zipperPoints.length >= 2) {
    const zipCurve = new THREE.CatmullRomCurve3(zipperPoints);
    const zipGeo = new THREE.TubeGeometry(zipCurve, 40, 0.25, 6, false);
    const zipper = new THREE.Mesh(zipGeo, detailMat);
    zipper.name = 'zipper';
    group.add(zipper);
  }

  // ── Sleeve cuffs ──
  for (const side of [-1, 1]) {
    const cuffGeo = new THREE.TorusGeometry(3.2 * 0.9, 0.4, 8, 24);
    const cuff = new THREE.Mesh(cuffGeo, detailMat);
    cuff.position.set(side * 16, -10, 1);
    cuff.rotation.x = Math.PI / 2;
    cuff.rotation.z = side * 0.1;
    cuff.name = side < 0 ? 'cuffLeft' : 'cuffRight';
    group.add(cuff);
  }

  return group;
}

// Approximate body radius at height y (matches ParkaBody profile)
function bodyRadiusAtY(y) {
  if (y < -28) return 14.5;
  if (y < -16) return 14.5 - (y + 28) * 0.1;
  if (y < -6)  return 13.2 - (y + 16) * 0.07;
  if (y < 0)   return 12.5 - (y + 6) * 0.12;
  if (y < 8)   return 11.8 + y * 0.05;
  if (y < 14)  return 12.2 + (y - 8) * 0.05;
  if (y < 18)  return 12.5 - (y - 14) * 0.12;
  if (y < 22)  return 12.0 - (y - 18) * 0.2;
  return 11.2 - (y - 22) * 0.33;
}
