/**
 * GownWheels.js — Tiny wheels embedded along gown hem and train.
 * InstancedMesh for performance. Wheels are partially embedded so
 * top half is inside fabric, bottom peeks below floor level.
 */
import * as THREE from 'three';

export function buildGownWheels({ wheelCount = 80, wheelSize = 0.5, skirtFlare = 1.0, trainLength = 25 } = {}) {
  const group = new THREE.Group();
  group.name = 'gownWheels';

  const hemRadius = 15.0 * skirtFlare;
  const zScale = 0.78;
  const floorY = -32;

  // Wheel geometry: torus (tire) — merge into single geometry
  const tireGeo = new THREE.TorusGeometry(0.4, 0.14, 8, 14);
  // Hub: small cylinder through center
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8);
  hubGeo.rotateZ(Math.PI / 2); // align hub axis with torus hole

  // Merge tire + hub
  const mergedGeo = mergeGeometries(tireGeo, hubGeo);

  // Materials
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.85,
    metalness: 0.15,
  });

  const inst = new THREE.InstancedMesh(mergedGeo, tireMat, wheelCount);
  inst.name = 'wheelInstances';

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < wheelCount; i++) {
    // Distribute: ~60% along hem circle, ~40% along train
    const hemFraction = 0.6;
    const isHem = Math.random() < hemFraction;

    let x, y, z;
    let tangentDir;

    if (isHem) {
      // Place along full hem circle
      const angle = Math.random() * Math.PI * 2;
      x = Math.cos(angle) * hemRadius;
      z = Math.sin(angle) * hemRadius * zScale;
      y = floorY;

      // Tangent is perpendicular to radius in XZ plane
      tangentDir = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle) * zScale).normalize();
    } else {
      // Place along train (back half, extending in -Z)
      const u = Math.random(); // arc position (0-1 across back arc)
      const v = Math.random(); // distance along train (0-1)

      const angle = Math.PI + u * Math.PI; // back half
      const taper = 1.0 - v * 0.4;
      const dist = v * trainLength;

      x = Math.cos(angle) * hemRadius * taper;
      z = Math.sin(angle) * hemRadius * zScale * taper - dist;
      y = floorY;

      // Tangent along the arc
      tangentDir = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle) * zScale).normalize();
    }

    // Position: partially embedded (shift down so top half is in fabric)
    dummy.position.set(x, y - wheelSize * 0.15, z);

    // Orient: wheel rotation axis aligns with tangent direction
    // The torus lies in the XY plane by default, hole along Z
    // We want the rolling direction along tangent, so the axle points along tangent
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangentDir);
    dummy.quaternion.copy(quat);

    dummy.scale.setScalar(wheelSize);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }

  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true;
  group.add(inst);

  return group;
}

/** Simple merge of two BufferGeometries (positions + normals only) */
function mergeGeometries(geoA, geoB) {
  const posA = geoA.attributes.position;
  const posB = geoB.attributes.position;
  const normA = geoA.attributes.normal;
  const normB = geoB.attributes.normal;

  const totalVerts = posA.count + posB.count;
  const positions = new Float32Array(totalVerts * 3);
  const normals   = new Float32Array(totalVerts * 3);

  // Copy A
  for (let i = 0; i < posA.count * 3; i++) {
    positions[i] = posA.array[i];
    normals[i]   = normA.array[i];
  }
  // Copy B
  const offset = posA.count * 3;
  for (let i = 0; i < posB.count * 3; i++) {
    positions[offset + i] = posB.array[i];
    normals[offset + i]   = normB.array[i];
  }

  // Merge indices
  const idxA = geoA.index ? Array.from(geoA.index.array) : [...Array(posA.count).keys()];
  const idxB = geoB.index ? Array.from(geoB.index.array).map(v => v + posA.count)
                          : [...Array(posB.count).keys()].map(v => v + posA.count);

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
  merged.setIndex([...idxA, ...idxB]);

  return merged;
}
