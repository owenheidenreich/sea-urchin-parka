/**
 * buildParkaScene.js — Assembles parka meshes from engine modules.
 * Returns { garmentGroup, mannequin, ammoMesh, wheels: null, medallion: null }
 */
import * as THREE from 'three';
import { buildMannequin } from './Mannequin.js';
import { buildParkaBody } from './ParkaBody.js';
import { buildParkaHood } from './ParkaHood.js';
import { buildParkaSleeves } from './ParkaSleeves.js';
import { buildParkaDetails } from './ParkaDetails.js';
import { buildAmmoInstances } from './AmmoPlacement.js';
import { THEMES } from '../utils/themes.js';

export function buildParkaScene(state) {
  const p = state.parka;

  // Mannequin
  const mannequin = buildMannequin();
  mannequin.visible = state.showMannequin;

  // Parka group
  const garmentGroup = new THREE.Group();
  garmentGroup.name = 'parka';

  const body = buildParkaBody();
  garmentGroup.add(body);

  const hood = buildParkaHood(p.hoodDepth);
  garmentGroup.add(hood);

  const sleeves = buildParkaSleeves();
  garmentGroup.add(sleeves);

  const details = buildParkaDetails();
  garmentGroup.add(details);

  // Force world matrix update before sampling
  garmentGroup.updateMatrixWorld(true);

  // Ammunition
  const T = THEMES[state.themeKey] || THEMES.brass;
  const ammoResult = buildAmmoInstances(garmentGroup, {
    count: state.ammoCount,
    sizeMin: state.ammoSizeMin,
    sizeMax: state.ammoSizeMax,
    spread: state.ammoSpread,
    flatRatio: state.flatRatio,
    layerCount: state.layerCount,
    theme: T,
  });

  let ammoMesh = null;
  if (ammoResult) {
    ammoMesh = ammoResult.mesh;
    ammoMesh.visible = state.showAmmo;
  }

  return { garmentGroup, mannequin, ammoMesh, wheels: null, medallion: null };
}
