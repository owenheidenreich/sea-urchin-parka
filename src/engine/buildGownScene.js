/**
 * buildGownScene.js — Assembles gown meshes from engine modules.
 * Returns { garmentGroup, mannequin, ammoMesh, wheels, medallion }
 */
import * as THREE from 'three';
import { buildGownMannequin } from './GownMannequin.js';
import { buildGownBody } from './GownBody.js';
import { buildGownTrain } from './GownTrain.js';
import { buildGownDetails } from './GownDetails.js';
import { buildGownWheels } from './GownWheels.js';
import { buildAmmoInstances } from './AmmoPlacement.js';
import { buildFlowerMedallion } from './FlowerMedallion.js';
import { THEMES } from '../utils/themes.js';

export function buildGownScene(state) {
  const g = state.gown;

  // Mannequin
  const mannequin = buildGownMannequin();
  mannequin.visible = state.showMannequin;

  // Gown group
  const garmentGroup = new THREE.Group();
  garmentGroup.name = 'gown';

  const body = buildGownBody({
    bodiceHeight: g.bodiceHeight,
    skirtFlare: g.skirtFlare,
    slitHeight: g.slitHeight,
    slitWidth: g.slitWidth,
    waistWidth: g.waistWidth,
    bustWidth: g.bustWidth,
    hipWidth: g.hipWidth,
    hemHeight: g.hemHeight,
  });
  garmentGroup.add(body);

  const train = buildGownTrain({
    trainLength: g.trainLength,
    trainWidth: g.trainWidth,
    skirtFlare: g.skirtFlare,
  });
  garmentGroup.add(train);

  const details = buildGownDetails({
    bodiceHeight: g.bodiceHeight,
    skirtFlare: g.skirtFlare,
  });
  garmentGroup.add(details);

  // Wheels
  const wheels = buildGownWheels({
    wheelCount: g.wheelCount,
    wheelSize: g.wheelSize,
    skirtFlare: g.skirtFlare,
    trainLength: g.trainLength,
  });
  wheels.visible = state.showWheels;

  // Medallion
  const medallion = buildFlowerMedallion();
  medallion.scale.setScalar(g.medallionScale);
  medallion.position.set(g.medallionX, g.medallionY, 9.8);
  medallion.visible = state.showMedallion;

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

  return { garmentGroup, mannequin, ammoMesh, wheels, medallion };
}
