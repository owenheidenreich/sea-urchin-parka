/**
 * GownDetails.js — Construction details for the fitted column gown.
 * Top-edge band at V-neckline, waist band, hem band, back seam.
 */
import * as THREE from 'three';
import { DETAIL_COLOR } from '../utils/themes.js';

export function buildGownDetails({ bodiceHeight = 16, skirtFlare = 1.0 } = {}) {
  const group = new THREE.Group();
  group.name = 'gownDetails';

  const mat = new THREE.MeshPhysicalMaterial({
    color: DETAIL_COLOR,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7,
    sheen: 0.8,
    sheenRoughness: 0.2,
    sheenColor: new THREE.Color(0x3a3a5e),
  });

  const zScale = 0.78;

  // ── Waist cinch band ──
  const waistRadius = 10.8;
  const waistGeo = new THREE.TorusGeometry(waistRadius * 0.89, 0.18, 8, 48);
  const waistBand = new THREE.Mesh(waistGeo, mat);
  waistBand.rotation.x = Math.PI / 2;
  waistBand.position.y = 0;
  waistBand.scale.set(1, zScale, 1);
  group.add(waistBand);

  // ── Hem band at floor level ──
  const hemRadius = 15.0 * skirtFlare;
  const hemBandGeo = new THREE.TorusGeometry(hemRadius * 0.89, 0.18, 8, 48);
  const hemBand = new THREE.Mesh(hemBandGeo, mat);
  hemBand.rotation.x = Math.PI / 2;
  hemBand.position.y = -32;
  hemBand.scale.set(1, zScale, 1);
  group.add(hemBand);

  // ── Back seam line (center back, from neckline to hem) ──
  const seamPoints = [];
  const seamSteps = 40;
  for (let i = 0; i <= seamSteps; i++) {
    const t = i / seamSteps;
    const y = bodiceHeight - t * (bodiceHeight + 32);
    const r = getGownRadiusAtY(y, bodiceHeight, skirtFlare);
    // Back center: angle = π, so x = -r, z = 0
    seamPoints.push(new THREE.Vector3(-r, y, 0));
  }
  const seamCurve = new THREE.CatmullRomCurve3(seamPoints);
  const seamGeo = new THREE.TubeGeometry(seamCurve, 40, 0.08, 6, false);
  const seam = new THREE.Mesh(seamGeo, mat);
  seam.name = 'gownSeam';
  group.add(seam);

  return group;
}

/** Approximate gown radius at a given Y height — matches column silhouette */
function getGownRadiusAtY(y, bodiceHeight, skirtFlare) {
  if (y >= bodiceHeight) return 8.0;
  if (y >= 14) return 11.0;
  if (y >= 11) return 12.8;
  if (y >= 8) return 12.5;
  if (y >= 4) return 11.5;
  if (y >= 0) return 10.8;   // waist
  if (y >= -4) return 12.2;  // hip
  if (y >= -8) return 11.5;
  if (y >= -14) return 10.5;
  if (y >= -20) return 10.0;
  if (y >= -26) return 11.0 * skirtFlare;
  if (y >= -30) return 13.5 * skirtFlare;
  return 15.0 * skirtFlare;
}
