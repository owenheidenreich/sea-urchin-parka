import { create } from 'zustand';

export const useStore = create((set) => ({
  // Garment parameters
  bodyLength:   56,    // hem-to-collar in units (560mm)
  waistTaper:   0.92,  // waist narrowing factor
  hoodDepth:    14,    // how tall the hood is
  sleeveLength: 32,    // shoulder to wrist
  collarHeight: 4,     // collar band height

  // Medallion
  medallionScale: 1.0,
  medallionX:     0,
  medallionY:     6,

  // Decoration
  ammoCount:    5000,
  ammoSizeMin:  0.4,
  ammoSizeMax:  1.3,
  ammoSpread:   35,    // degrees from surface normal
  flatRatio:    0.5,   // 0=all urchin, 1=all flat-laying
  layerCount:   1,     // stacking layers (1-3)
  themeKey:     'brass',

  // Viewer
  showMannequin: true,
  showMedallion: true,
  showAxes:      true,
  showWireframe: false,
  waveEnabled:   false,
  cameraPreset:  '3/4',
  bgShade:       0,        // 0-5 index into BG_SHADES

  // Actions
  set: (partial) => set(partial),
  setCameraPreset: (v) => set({ cameraPreset: v }),
  toggleMannequin: () => set((s) => ({ showMannequin: !s.showMannequin })),
  toggleMedallion: () => set((s) => ({ showMedallion: !s.showMedallion })),
  toggleAxes:      () => set((s) => ({ showAxes: !s.showAxes })),
  toggleWireframe: () => set((s) => ({ showWireframe: !s.showWireframe })),
  toggleWave:      () => set((s) => ({ waveEnabled: !s.waveEnabled })),
  setBgShade:      (v) => set({ bgShade: v }),
}));
