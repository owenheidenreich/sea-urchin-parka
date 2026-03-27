import { create } from 'zustand';

export const useStore = create((set) => ({
  // Garment parameters
  bodyLength:   56,    // hem-to-collar in units (560mm)
  waistTaper:   0.92,  // waist narrowing factor
  hoodDepth:    14,    // how tall the hood is
  sleeveLength: 32,    // shoulder to wrist
  collarHeight: 4,     // collar band height

  // Decoration
  ammoCount:    4000,
  ammoSizeMin:  0.4,
  ammoSizeMax:  1.3,
  ammoSpread:   35,    // degrees from surface normal
  themeKey:     'brass',

  // Viewer
  showMannequin: true,
  showWireframe: false,
  waveEnabled:   false,
  cameraPreset:  '3/4',

  // Actions
  set: (partial) => set(partial),
  setCameraPreset: (v) => set({ cameraPreset: v }),
  toggleMannequin: () => set((s) => ({ showMannequin: !s.showMannequin })),
  toggleWireframe: () => set((s) => ({ showWireframe: !s.showWireframe })),
  toggleWave:      () => set((s) => ({ waveEnabled: !s.waveEnabled })),
}));
