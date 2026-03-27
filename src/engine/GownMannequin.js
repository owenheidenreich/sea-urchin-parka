/**
 * GownMannequin.js — Feminine mannequin for the strapless gown.
 * Visible: head, neck, shoulders, arms, legs (through slit).
 * Proportions: narrower waist, wider hips, slender arms.
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

function sphere(r, y, x = 0, z = 0) {
  const geo = new THREE.SphereGeometry(r, 16, 12);
  const mesh = new THREE.Mesh(geo, MAT);
  mesh.position.set(x, y, z);
  return mesh;
}

function limb(r, h, pos, rotZ = 0) {
  const geo = new THREE.CylinderGeometry(r * 0.85, r, h, 8);
  const mesh = new THREE.Mesh(geo, MAT);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rotZ) mesh.rotation.z = rotZ;
  return mesh;
}

export function buildGownMannequin() {
  const group = new THREE.Group();
  group.name = 'mannequin';

  // Head
  group.add(sphere(3.5, 31));

  // Neck
  group.add(capsule(1.6, 1.8, 3, 27));

  // Upper torso (shoulders/chest — visible above strapless bodice)
  group.add(capsule(4.8, 5.2, 10, 20));

  // Lower torso (inside bodice)
  group.add(capsule(5.2, 4.5, 10, 10));

  // Waist — narrower for feminine silhouette
  group.add(capsule(4.5, 5.0, 6, 2));

  // Hips — wider
  group.add(capsule(5.0, 4.8, 6, -3));

  // Upper legs
  group.add(limb(2.3, 14, [-3, -12, 0]));
  group.add(limb(2.3, 14, [ 3, -12, 0]));

  // Lower legs
  group.add(limb(1.8, 12, [-3, -24, 0]));
  group.add(limb(1.8, 12, [ 3, -24, 0]));

  // Feet
  group.add(sphere(1.2, -30, -3, 0.5));
  group.add(sphere(1.2, -30,  3, 0.5));

  // Upper arms — bare (no sleeves), slightly away from body
  group.add(limb(1.6, 11, [-7.5, 17, 0], 0.12));
  group.add(limb(1.6, 11, [ 7.5, 17, 0], -0.12));

  // Forearms
  group.add(limb(1.2, 11, [-8.5, 7, 0.5], 0.08));
  group.add(limb(1.2, 11, [ 8.5, 7, 0.5], -0.08));

  // Hands (small spheres)
  group.add(sphere(1.0, 1, -8.8, 0.8));
  group.add(sphere(1.0, 1,  8.8, 0.8));

  return group;
}
