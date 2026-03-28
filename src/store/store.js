import { create } from 'zustand';

export const useStore = create((set) => ({
  // ── Active garment ──
  activeGarment: 'gown',   // 'gown' | 'parka'
  setActiveGarment: (g) => set({ activeGarment: g }),

  // ── Gown-specific parameters ──
  gown: {
    bodiceHeight:  16,
    skirtFlare:    1.0,
    slitHeight:    -10,
    slitWidth:     5,
    waistWidth:    10.8,
    bustWidth:     12.5,
    hipWidth:      12.2,
    hemHeight:     -32,
    trainLength:   25,
    trainWidth:    1.0,
    wheelCount:    80,
    wheelSize:     0.5,
    medallionScale: 1.0,
    medallionX:     0,
    medallionY:     6,
  },
  setGownParam: (k, v) => set((s) => ({ gown: { ...s.gown, [k]: v } })),

  // ── Parka-specific parameters ──
  parka: {
    hoodDepth:     14,
    bodyLength:    56,
    waistTaper:    0.92,
    sleeveLength:  32,
    collarHeight:  4,
  },
  setParkaParam: (k, v) => set((s) => ({ parka: { ...s.parka, [k]: v } })),

  // ── Shared decoration (ammunition) ──
  ammoCount:    6000,
  ammoSizeMin:  0.4,
  ammoSizeMax:  1.3,
  ammoSpread:   35,
  flatRatio:    0.5,
  layerCount:   1,
  themeKey:     'brass',

  // ── Shared viewer state ──
  showAmmo:      true,
  showMannequin: true,
  showMedallion: true,
  showWheels:    true,
  showAxes:      true,
  showWireframe: false,
  waveEnabled:   false,
  cameraPreset:  '3/4',
  bgShade:       0,

  // ── Actions ──
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
