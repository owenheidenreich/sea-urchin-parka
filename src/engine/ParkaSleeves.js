/**
 * ParkaSleeves.js — Bezier tube sleeves with tapered radius.
 */
import * as THREE from 'three';
import { SLEEVE_COLOR } from '../utils/themes.js';

export function buildParkaSleeves() {
  const group = new THREE.Group();
  group.name = 'parkaSleeves';

  for (const side of [-1, 1]) {
    const name = side < 0 ? 'leftSleeve' : 'rightSleeve';

    // Cubic Bezier: shoulder → upper arm → elbow → wrist
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(side * 12,  22,  0),     // shoulder
      new THREE.Vector3(side * 17,  14, -1),     // upper arm
      new THREE.Vector3(side * 19,   2,  0),     // elbow
      new THREE.Vector3(side * 16, -10,  1),     // wrist
    );

    const STEPS = 32;
    const SEGS  = 16;
    const positions = [];
    const normals   = [];
    const indices   = [];

    for (let si = 0; si <= STEPS; si++) {
      const t   = si / STEPS;
      const pt  = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();

      // Radius: tapers from shoulder to wrist
      const r = 5.0 - 1.8 * t;

      // Build a stable frame
      const up    = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tan, up).normalize();
      const bitn  = new THREE.Vector3().crossVectors(right, tan).normalize();

      for (let s = 0; s <= SEGS; s++) {
        const a  = (s / SEGS) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);

        const nx = right.x * ca + bitn.x * sa;
        const ny = right.y * ca + bitn.y * sa;
        const nz = right.z * ca + bitn.z * sa;
        const nm = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

        positions.push(pt.x + nx * r, pt.y + ny * r, pt.z + nz * r);
        normals.push(nx / nm, ny / nm, nz / nm);
      }
    }

    // Indices: connect adjacent rings
    for (let si = 0; si < STEPS; si++) {
      for (let s = 0; s < SEGS; s++) {
        const a = si * (SEGS + 1) + s;
        const b = a + 1;
        const c = a + (SEGS + 1);
        const d = c + 1;
        indices.push(a, c, b,  b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshPhysicalMaterial({
      color: SLEEVE_COLOR,
      roughness: 0.82,
      metalness: 0.0,
      sheen: 0.4,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color(0x2a2a3e),
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}
