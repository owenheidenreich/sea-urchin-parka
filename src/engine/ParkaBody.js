/**
 * ParkaBody.js — Smooth parka torso using LatheGeometry.
 * Revolves a spline profile around Y, then Z-scales for elliptical cross-section.
 */
import * as THREE from 'three';
import { BODY_COLOR } from '../utils/themes.js';

export function buildParkaBody() {
  // Parka silhouette: half-width at each Y height
  const profileCurve = new THREE.SplineCurve([
    new THREE.Vector2(14.5, -28),   // hem flare
    new THREE.Vector2(14.0, -24),   // lower hem
    new THREE.Vector2(13.2, -16),   // lower body
    new THREE.Vector2(12.5,  -6),   // hip
    new THREE.Vector2(11.8,   0),   // waist
    new THREE.Vector2(12.2,   8),   // lower chest
    new THREE.Vector2(12.5,  14),   // chest
    new THREE.Vector2(12.0,  18),   // upper chest
    new THREE.Vector2(11.2,  22),   // shoulder
    new THREE.Vector2(10.2,  25),   // collar base
  ]);

  const points = profileCurve.getPoints(80);
  const geo = new THREE.LatheGeometry(points, 72);

  // Flatten front-to-back for realistic torso proportions
  geo.scale(1, 1, 0.78);
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhysicalMaterial({
    color: BODY_COLOR,
    roughness: 0.82,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0x2a2a3e),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'parkaBody';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
