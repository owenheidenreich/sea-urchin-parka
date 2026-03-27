/**
 * AmmoPlacement.js — Ammunition replica shapes covering the parka surface.
 * Uses MeshSurfaceSampler for proper surface-hugging placement,
 * InstancedMesh for GPU-efficient rendering.
 */
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * Create a bullet/cartridge LatheGeometry (unit height 0→1).
 */
function createAmmoGeometry() {
  const points = [
    new THREE.Vector2(0,     0),       // base center
    new THREE.Vector2(0.26,  0),       // base edge
    new THREE.Vector2(0.28,  0.02),    // rim
    new THREE.Vector2(0.28,  0.05),    // rim top
    new THREE.Vector2(0.24,  0.07),    // casing start
    new THREE.Vector2(0.24,  0.55),    // casing body
    new THREE.Vector2(0.17,  0.59),    // neck
    new THREE.Vector2(0.20,  0.62),    // bullet base
    new THREE.Vector2(0.20,  0.76),    // bullet body
    new THREE.Vector2(0.14,  0.86),    // taper
    new THREE.Vector2(0.06,  0.94),    // near tip
    new THREE.Vector2(0,     1.0),     // tip
  ];
  return new THREE.LatheGeometry(points, 8);
}

/**
 * Build instanced ammunition covering the parka surface.
 * @param {THREE.Group} parkaGroup — group containing parka meshes (body, hood, sleeves)
 * @param {object} opts — { count, sizeMin, sizeMax, spread, theme }
 * @returns {{ mesh: THREE.InstancedMesh, data: Array }}
 */
export function buildAmmoInstances(parkaGroup, opts) {
  const {
    count = 4000,
    sizeMin = 0.4,
    sizeMax = 1.3,
    spread = 35,
    theme = { bright: '#c8a86e', mid: '#6b5420' },
  } = opts;

  const spreadRad = spread * Math.PI / 180;

  // Collect all meshes from the parka group
  const meshes = [];
  parkaGroup.traverse((child) => {
    if (child.isMesh && child.name !== 'hoodSeam' && child.geometry) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) return null;

  // Build a sampler for each mesh, weighted by surface area
  const samplers = [];
  const areas = [];
  let totalArea = 0;

  for (const m of meshes) {
    // Clone geometry and apply world transform so sampling is in world space
    const geo = m.geometry.clone();
    geo.applyMatrix4(m.matrixWorld);

    // Estimate surface area from bounding box (rough but fast)
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const size = new THREE.Vector3();
    bb.getSize(size);
    const area = size.x * size.y + size.y * size.z + size.x * size.z;
    areas.push(area);
    totalArea += area;

    const tempMesh = new THREE.Mesh(geo);
    const sampler = new MeshSurfaceSampler(tempMesh).build();
    samplers.push(sampler);
  }

  // Distribute count proportionally by area
  const ammoGeo = createAmmoGeometry();
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.bright),
    emissive: new THREE.Color(theme.mid),
    emissiveIntensity: 0.12,
    roughness: 0.30,
    metalness: 0.65,
  });

  const instancedMesh = new THREE.InstancedMesh(ammoGeo, mat, count);
  instancedMesh.castShadow = true;
  instancedMesh.name = 'ammunition';

  const dummy = new THREE.Object3D();
  const _pos = new THREE.Vector3();
  const _nor = new THREE.Vector3();
  const _up  = new THREE.Vector3(0, 1, 0);
  const _quat = new THREE.Quaternion();
  const data = [];

  let idx = 0;
  for (let si = 0; si < samplers.length; si++) {
    const sampler = samplers[si];
    const meshCount = Math.round(count * (areas[si] / totalArea));

    for (let i = 0; i < meshCount && idx < count; i++) {
      sampler.sample(_pos, _nor);

      // Random size
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      const len = 1.5 + size * 2.0; // visual length

      // Wild angle variation from surface normal
      const tiltA = (Math.random() - 0.5) * spreadRad * 2;
      const tiltB = (Math.random() - 0.5) * spreadRad * 2;

      // Perturb normal
      const dir = _nor.clone().normalize();
      dir.x += Math.sin(tiltA) * 0.5;
      dir.z += Math.sin(tiltB) * 0.5;
      dir.normalize();

      // Orient the ammo piece along the perturbed normal
      _quat.setFromUnitVectors(_up, dir);
      dummy.position.copy(_pos);
      dummy.quaternion.copy(_quat);
      dummy.scale.set(size, len, size);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(idx, dummy.matrix);

      data.push({
        pos: [_pos.x, _pos.y, _pos.z],
        dir: [dir.x, dir.y, dir.z],
        size, len,
        phase: Math.random() * Math.PI * 2,
      });

      idx++;
    }
  }

  // Fill remaining if rounding left some
  if (idx < count && samplers.length > 0) {
    const sampler = samplers[0];
    while (idx < count) {
      sampler.sample(_pos, _nor);
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      const len = 1.5 + size * 2.0;
      const dir = _nor.clone().normalize();
      dir.x += (Math.random() - 0.5) * 0.3;
      dir.z += (Math.random() - 0.5) * 0.3;
      dir.normalize();
      _quat.setFromUnitVectors(_up, dir);
      dummy.position.copy(_pos);
      dummy.quaternion.copy(_quat);
      dummy.scale.set(size, len, size);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(idx, dummy.matrix);
      data.push({
        pos: [_pos.x, _pos.y, _pos.z],
        dir: [dir.x, dir.y, dir.z],
        size, len,
        phase: Math.random() * Math.PI * 2,
      });
      idx++;
    }
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  return { mesh: instancedMesh, data };
}
