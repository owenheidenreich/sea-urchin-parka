/**
 * Mannequin.js — Procedural human form for proportional reference.
 * Semi-transparent figure sized to fit INSIDE the parka.
 *
 * Parka body: y=-28 (hem) to y=25 (collar), radius 10-14.5
 * Hood: y=25 (neckline) to y=39 (crown)
 * Sleeves: shoulder y=22 to wrist y=-10
 */
import * as THREE from 'three';

const MAT = new THREE.MeshStandardMaterial({
  color: 0x888899, transparent: true, opacity: 0.25, roughness: 0.9,
});

function capsule(rTop, rBot, h, y) {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, 12);
  const mesh = new THREE.Mesh(geo, MAT);
  mesh.position.y = y;
  return mesh;
}

function sphere(r, y) {
  const geo = new THREE.SphereGeometry(r, 16, 12);
  const mesh = new THREE.Mesh(geo, MAT);
  mesh.position.y = y;
  return mesh;
}

function limb(r, h, pos, rotZ = 0) {
  const geo = new THREE.CylinderGeometry(r * 0.85, r, h, 8);
  const mesh = new THREE.Mesh(geo, MAT);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rotZ) mesh.rotation.z = rotZ;
  return mesh;
}

export function buildMannequin() {
  const group = new THREE.Group();
  group.name = 'mannequin';

  // Head — inside hood (hood crown at y=39, head should be well below)
  group.add(sphere(3.5, 31));

  // Neck — at collar level (parka collar y=25)
  group.add(capsule(1.8, 2.0, 3, 27));

  // Upper torso — shoulder to mid-chest (y=14 to y=25)
  group.add(capsule(5.0, 5.5, 12, 19));

  // Lower torso — mid-chest to waist (y=4 to y=14)
  group.add(capsule(5.5, 5.0, 10, 9));

  // Hips — waist to upper thigh (y=-4 to y=4)
  group.add(capsule(5.0, 4.5, 8, 0));

  // Upper legs
  group.add(limb(2.5, 14, [-3, -11, 0]));
  group.add(limb(2.5, 14, [ 3, -11, 0]));

  // Lower legs
  group.add(limb(2.0, 10, [-3, -23, 0]));
  group.add(limb(2.0, 10, [ 3, -23, 0]));

  // Upper arms — at shoulder level (y≈16-22, matching sleeve shoulder at y=22)
  group.add(limb(2.0, 12, [-8, 16, 0], 0.15));
  group.add(limb(2.0, 12, [ 8, 16, 0], -0.15));

  // Forearms — hanging down (y≈4-12, matching sleeve path)
  group.add(limb(1.5, 12, [-9.5, 5, 0.5], 0.1));
  group.add(limb(1.5, 12, [ 9.5, 5, 0.5], -0.1));

  return group;
}
