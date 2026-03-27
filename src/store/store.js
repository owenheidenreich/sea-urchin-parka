import { create } from 'zustand';

export const useStore = create((set) => ({
  // Gown parameters
  bodiceHeight:  16,    // y-position of strapless top edge
  skirtFlare:    1.0,   // multiplier on hem radius
  slitHeight:    -10,   // y where front slit begins
  slitWidth:     5,     // half-width of slit in x units
  waistWidth:    10.8,  // waist radius
  bustWidth:     12.5,  // bust radius
  hipWidth:      12.2,  // hip radius
  hemHeight:     -32,   // y-position of hem/floor
  trainLength:   25,    // how far train extends behind
  trainWidth:    1.0,   // multiplier on train width
  wheelCount:    80,    // number of embedded wheels
  wheelSize:     0.5,   // scale of each wheel

  // Medallion
  medallionScale: 1.0,
  medallionX:     0,
  medallionY:     6,

  // Decoration (ammunition)
  ammoCount:    6000,
  ammoSizeMin:  0.4,
  ammoSizeMax:  1.3,
  ammoSpread:   35,    // degrees from surface normal
  flatRatio:    0.5,   // 0=all urchin, 1=all flat-laying
  layerCount:   1,     // stacking layers (1-3)
  themeKey:     'brass',

  // Viewer
  showAmmo:      true,
  showMannequin: true,
  showMedallion: true,
  showWheels:    true,
  showAxes:      true,
  showWireframe: false,
  waveEnabled:   false,
  cameraPreset:  '3/4',
  bgShade:       0,        // 0-5 index into BG_SHADES

  // Actions
  set: (partial) => set(partial),
  setCameraPreset: (v) => set({ cameraPreset: v }),
  toggleAmmo:      () => set((s) => ({ showAmmo: !s.showAmmo })),
  toggleMannequin: () => set((s) => ({ showMannequin: !s.showMannequin })),
  toggleMedallion: () => set((s) => ({ showMedallion: !s.showMedallion })),
  toggleWheels:    () => set((s) => ({ showWheels: !s.showWheels })),
  toggleAxes:      () => set((s) => ({ showAxes: !s.showAxes })),
  toggleWireframe: () => set((s) => ({ showWireframe: !s.showWireframe })),
  toggleWave:      () => set((s) => ({ waveEnabled: !s.waveEnabled })),
  setBgShade:      (v) => set({ bgShade: v }),
}));
