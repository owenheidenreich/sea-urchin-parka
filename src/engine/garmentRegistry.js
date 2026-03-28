/**
 * garmentRegistry.js — Maps garment keys to builders and camera presets.
 */
import { buildGownScene } from './buildGownScene.js';
import { buildParkaScene } from './buildParkaScene.js';

export const GARMENT_PRESETS = {
  gown: {
    FRONT: { pos: [0, 5, 80],   tgt: [0, 0, 0] },
    BACK:  { pos: [0, 5, -80],  tgt: [0, 0, 0] },
    LEFT:  { pos: [-80, 5, 0],  tgt: [0, 0, 0] },
    RIGHT: { pos: [80, 5, 0],   tgt: [0, 0, 0] },
    TOP:   { pos: [0, 90, 1],   tgt: [0, 0, 0] },
    '3/4': { pos: [55, 25, 55], tgt: [0, 0, 0] },
  },
  parka: {
    FRONT: { pos: [0, 10, 75],   tgt: [0, 10, 0] },
    BACK:  { pos: [0, 10, -75],  tgt: [0, 10, 0] },
    LEFT:  { pos: [-75, 10, 0],  tgt: [0, 10, 0] },
    RIGHT: { pos: [75, 10, 0],   tgt: [0, 10, 0] },
    TOP:   { pos: [0, 90, 1],    tgt: [0, 10, 0] },
    '3/4': { pos: [50, 30, 50],  tgt: [0, 10, 0] },
  },
};

export const GARMENT_BUILDERS = {
  gown:  buildGownScene,
  parka: buildParkaScene,
};
