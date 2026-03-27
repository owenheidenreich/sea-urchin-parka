# CLAUDE.md — Sea Urchin Parka: Full 3D Designer
## Engineering Specification for AI Agent

---

## 1. Project Overview

This document is an engineering specification for an AI coding agent tasked with building the **Full 3D Designer** for the Sea Urchin Parka project — a biomimetic wearable garment made entirely from 3D-printed collapsible spines arranged in a sea urchin (*Strongylocentrotus purpuratus*) distribution pattern.

The current prototype (`sea-urchin-parka-v3.html`) is a browser-based canvas 2.5D visualization tool with:
- Perspective-projected 3D spine placement
- Drag-to-rotate with momentum
- 6 anatomical zones (hood, collar, chest, sleeves, lower body)
- Procedural spine generation from elliptical cross-section profiles
- Color themes, telescoping preview, wave animation

The Full 3D Designer is the next-generation software that replaces canvas projection with a real 3D engine and adds a complete design-to-manufacture pipeline.

---

## 2. Target Stack

| Layer | Technology | Rationale |
|---|---|---|
| 3D Runtime | **Three.js r160+** | Browser-native, excellent docs, STL/GLTF export |
| UI Framework | **React 18 + Vite** | Component isolation for panels, hot reload |
| State Management | **Zustand** | Lightweight, no boilerplate, perfect for 3D tool state |
| Parametric Engine | **Custom JS** | Spine arrays need full control over procedural math |
| Physics | **Cannon-es** | WASM-powered rigid body for spine collision sim |
| STL Export | **three-stdlib** + custom | Binary STL per zone + merged export |
| File I/O | **JSZip** | Bundle all export artifacts into a single .zip |
| Styling | **Tailwind CSS** | Utility-first, consistent with existing dark UI |
| Fonts | **Orbitron + Rajdhani** | Keep existing brand identity |

---

## 3. Application Architecture

```
sea-urchin-designer/
├── src/
│   ├── main.jsx                  # App entry, React root
│   ├── App.jsx                   # Layout shell (3-column grid)
│   │
│   ├── store/
│   │   ├── designStore.js        # Zustand: spine config, zones, camera
│   │   └── exportStore.js        # Zustand: export queue, progress
│   │
│   ├── engine/
│   │   ├── ParkaGeometry.js      # Parka 3D mesh generation (Three.js)
│   │   ├── SpineGenerator.js     # Procedural spine array builder
│   │   ├── SpineParameters.js    # Telescoping spine math + tolerances
│   │   ├── PhysicsWorld.js       # Cannon-es integration
│   │   └── STLExporter.js        # Binary STL per zone + merged
│   │
│   ├── components/
│   │   ├── Viewer3D.jsx          # Three.js canvas, OrbitControls
│   │   ├── ControlPanel.jsx      # Left panel: sliders, presets
│   │   ├── SpecPanel.jsx         # Right panel: specs, export
│   │   ├── ViewPresets.jsx       # Animated view buttons
│   │   ├── ZoneInspector.jsx     # Click a zone → edit params
│   │   └── ProgressOverlay.jsx   # Generation / export progress
│   │
│   ├── hooks/
│   │   ├── useThreeScene.js      # Scene, camera, renderer lifecycle
│   │   ├── useDragRotate.js      # Pointer events → orbit
│   │   └── useSpineAnimation.js  # Wave + telescope animation loop
│   │
│   └── utils/
│       ├── math3d.js             # Vec3, rotation helpers
│       ├── biomimetic.js         # S. purpuratus distribution algos
│       └── colorThemes.js        # Theme definitions
│
├── public/
│   └── assets/                   # Reference images
│
├── CLAUDE.md                     # This file
├── package.json
└── vite.config.js
```

---

## 4. Feature Specifications

### 4.1 Full 3D Viewer (`Viewer3D.jsx`)

**Renderer**
- `THREE.WebGLRenderer` with antialiasing, shadow maps enabled
- Responsive canvas via `ResizeObserver`
- Background: custom GLSL shader — deep ocean caustics, animated light shafts
- Post-processing: `UnrealBloomPass` on spine tips for bioluminescent glow

**Camera**
- `THREE.PerspectiveCamera` — FOV 45°, near 0.1, far 1000
- `OrbitControls` from three/examples
  - Enable damping: `dampingFactor = 0.08`
  - Min/max polar angle: `0.1` to `π - 0.1` (no flipping)
  - Min zoom: `15`, Max zoom: `200`
  - Touch: two-finger pinch zoom + single-finger orbit

**View Preset Animations**
```js
// Each preset tweens camera position + target using GSAP or manual lerp
const PRESETS = {
  FRONT:  { position: [0, 0, 80],    target: [0, 0, 0] },
  BACK:   { position: [0, 0, -80],   target: [0, 0, 0] },
  LEFT:   { position: [-80, 0, 0],   target: [0, 0, 0] },
  RIGHT:  { position: [80, 0, 0],    target: [0, 0, 0] },
  TOP:    { position: [0, 80, 0.01], target: [0, 0, 0] },
  '3/4':  { position: [55, 40, 55],  target: [0, 0, 0] },
}
// Tween duration: 600ms, ease: cubicInOut
```

**Lighting Setup**
```js
// Key light — front-left above
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(-30, 60, 40);
key.castShadow = true;

// Fill light — right side, warm
const fill = new THREE.DirectionalLight(0xffddcc, 0.4);
fill.position.set(40, 0, -20);

// Rim light — back-top, cool blue
const rim = new THREE.DirectionalLight(0x4488ff, 0.6);
rim.position.set(0, 50, -50);

// Ambient
const amb = new THREE.AmbientLight(0x001830, 0.8);
```

---

### 4.2 Parka Geometry Engine (`ParkaGeometry.js`)

**Body Mesh Generation**
The parka is constructed as a parametric surface using `THREE.LatheGeometry` profiles combined with custom sleeve extrusions.

```js
// Profile points define the parka silhouette on the XY plane (half-width at each Y)
// Y units = mm / 10  (so full parka is ~65 units tall = 650mm)
const BODY_PROFILE = [
  // [halfWidth, Y]  — bottom hem to hood peak
  [14.0, -30],   // hem flare
  [13.5, -20],
  [13.0, -10],
  [12.5,   0],
  [12.0,   8],   // waist
  [11.8,  14],   // mid chest
  [11.5,  18],   // armhole level
  [10.0,  22],   // collar base
  // Collar puff (separate mesh)
  [8.0,   28],   // neck
  [7.0,   33],   // hood base
  [0.0,   40],   // hood peak
];
```

**Material Assignment per Zone**
Each anatomical zone is a separate `THREE.Mesh` with its own `MeshStandardMaterial`. Zone colors are driven by `colorThemes.js`.

```js
const ZONES = ['hood', 'collar', 'leftSleeve', 'rightSleeve', 'chest', 'lower'];
// Each zone = { mesh: THREE.Mesh, spineGroup: THREE.Group, color: hex }
```

**Sleeve Geometry**
Use `THREE.TubeGeometry` along a cubic Bezier curve:
```js
// Left sleeve path
const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-12, 18, 0),   // shoulder joint
  new THREE.Vector3(-18, 12, -2),  // upper arm
  new THREE.Vector3(-20,  4,  0),  // elbow
  new THREE.Vector3(-18, -6,  1),  // wrist
);
// Radius: tapers from 4.5 at shoulder to 3.0 at wrist
// Use custom TubeGeometry subclass with variable radius
```

---

### 4.3 Spine Generator (`SpineGenerator.js`)

**Algorithm: Surface Normal Sampling**

```js
// 1. BVH-accelerate the body mesh for fast surface point sampling
// 2. For each surface point, compute the outward vertex normal
// 3. Place spine root at surface point
// 4. Spine tip = root + normal * length * (0.5 + random()*0.7)
// 5. Add jitter angle: ± spreadAngle degrees from normal
// 6. 20% of spines use a grid-aligned direction (horizontal/vertical overlay)

function generateSpineOnMesh(mesh, count, params) {
  const sampler = new MeshSurfaceSampler(mesh).build();
  const spines = [];
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3();
    const normal   = new THREE.Vector3();
    sampler.sample(position, normal);
    // ... build spine geometry
    spines.push(createSpineObject(position, normal, params));
  }
  return spines;
}
```

**Spine Geometry (`SpineParameters.js`)**

Each spine is a `THREE.ConeGeometry` or custom `TaperGeometry`:
```js
// Tapered cylinder: wide base, pointed tip
// radiusBottom = thickness (0.3–0.8mm in real units)
// radiusTop    = 0.05mm (near-zero)
// height       = spineLength

// Telescoping: 3 nested segments
// Outer: radius 0.6, length full
// Mid:   radius 0.45, length 0.75× outer
// Core:  radius 0.3,  length 0.5×  outer
// Gap tolerance between segments: 0.15mm (export spec)

// Animation: lerp all segment translations on Y-axis
// Collapsed state: all nested flush
// Extended state: each segment offset by segment_length * 0.8
```

**Density Distribution (Biomimetic)**

```js
// Inspired by S. purpuratus pentagonal symmetry
// Primary ambulacral zones: 5 bands of slightly longer spines
// Interambulacral zones: shorter infill spines
// Oral region (hem): shorter, angled downward
// Aboral region (hood peak): shortest, near-vertical

function getBiomimeticDensity(surfacePoint, zoneId) {
  const theta = Math.atan2(surfacePoint.z, surfacePoint.x); // azimuth
  const phi   = Math.asin(surfacePoint.y / radius);          // elevation
  // Pentagonal modulation
  const ambulacral = Math.cos(5 * theta) * 0.5 + 0.5;
  return BASE_DENSITY[zoneId] * (0.7 + 0.3 * ambulacral);
}
```

---

### 4.4 Physics Simulation (`PhysicsWorld.js`)

**Scope:** Optional toggle. When enabled, allows user to:
1. See spine collision with surfaces (no inter-penetration)
2. Preview garment weight distribution
3. Simulate what happens when wearer moves arms

**Integration**
```js
import * as CANNON from 'cannon-es';

// One CylinderShape per spine (approximation of cone)
// Static body for parka mesh (trimesh or compound capsules)
// Kinematic body for arm movement preview
// Step simulation at 60Hz decoupled from render loop

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
```

**Constraints**
- Each spine base has a `CANNON.HingeConstraint` to the parka surface
- Max angular deflection: 35° from normal (material limits)
- Spring constant: 4.0 N/m (PETG flex simulation)

---

### 4.5 STL Export Pipeline (`STLExporter.js`)

**Export Modes**

| Mode | Contents | Use Case |
|---|---|---|
| Full Merged | All zones as one file | Slicer preview |
| Per Zone | 6 separate STL files | Print farm distribution |
| Spines Only | Detached spine geometry | Print in batches of 24 |
| Body Frame | Parka substrate without spines | Structural layer |

**Process**
```js
// 1. Collect all THREE.Mesh objects for selected export mode
// 2. Merge BufferGeometries (THREE.BufferGeometryUtils.mergeGeometries)
// 3. Apply worldMatrix transforms (bake into geometry)
// 4. Scale to real units: 1 Three.js unit = 10mm
// 5. Write binary STL using three-stdlib STLExporter
// 6. Bundle into JSZip alongside assembly_guide.pdf and bom.csv

async function exportAll(zones, params) {
  const zip = new JSZip();
  for (const zone of zones) {
    const stlBuffer = exportZoneToSTL(zone);
    zip.file(`zone_${zone.id}.stl`, stlBuffer);
  }
  zip.file('assembly_guide.md', generateAssemblyGuide(params));
  zip.file('bom.csv', generateBOM(params));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, 'sea-urchin-parka.zip');
}
```

**Assembly Guide Generation**
Auto-generated Markdown file from current design state:
- Total spine count per zone
- Print time estimate (0.65h per 24-spine batch)
- Material weight per zone
- Attachment bolt spec (M3 × 8mm, 3 Nm torque)
- Zone connection order (hood → collar → chest → sleeves → lower)

---

### 4.6 Parametric Spine Arrays

**Concept:** Instead of fully random sampling, expose a structured "array editor" where user can:
- Define a spine cluster (count, length, spread, region)
- Duplicate the cluster in a pattern (radial, linear grid, pentagonal)
- Override clusters per zone
- Save/load named preset arrays

**Data Model**
```js
// SpineArray object stored in Zustand
const spineArray = {
  id: uuid(),
  zone: 'chest',
  count: 24,
  baseLength: 28,      // mm
  lengthVariance: 0.3,
  spreadAngle: 25,     // degrees
  pattern: 'radial',   // 'radial' | 'grid' | 'pentagonal' | 'random'
  patternScale: 1.0,
  telescoping: {
    segments: 3,
    collapseRatio: 0.45,
    springConstant: 4.0
  }
};
```

---

## 5. Hydro-Dip Integration

**Back Panel Flag Texture**
- On the parka back panel, a UV-mapped `THREE.MeshStandardMaterial` accepts a texture
- User uploads or selects flag image → auto-applied as `map` to back panel mesh
- Preview shows how flag wraps over 3D surface with spines overlaid
- Export generates: flag template (PNG, 300 DPI, with UV unwrap marks) for print-on-film services

```js
// UV unwrap the back of the parka body
// Conformal mapping (minimize distortion)
// Output: flat template image 1500px × 2200px showing where to print flag
function generateHydroDipTemplate(backPanelMesh, flagTexture) {
  // Raytrace UV → world coordinates → project to flat canvas
  // Overlay grid marks every 50mm for alignment
  // Return: { templateCanvas, instructions }
}
```

---

## 6. State Management Schema (Zustand)

```js
// designStore.js
{
  // Spine config
  spineCount: 450,
  maxSpineLength: 28,      // mm
  telescopingSegments: 3,
  spreadAngle: 28,         // degrees
  themeKey: 'pink',

  // Zones
  zones: {
    hood:         { enabled: true, overrideDensity: null, spineCount: 0 },
    collar:       { enabled: true, overrideDensity: null, spineCount: 0 },
    chest:        { enabled: true, overrideDensity: null, spineCount: 0 },
    lower:        { enabled: true, overrideDensity: null, spineCount: 0 },
    leftSleeve:   { enabled: true, overrideDensity: null, spineCount: 0 },
    rightSleeve:  { enabled: true, overrideDensity: null, spineCount: 0 },
  },

  // Viewer state
  camera: { position: [0,0,80], target: [0,0,0] },
  showLabels: false,
  waveEnabled: true,
  telescopePreview: false,
  physicsEnabled: false,

  // Actions
  setSpineCount, setTheme, toggleZone, setZoneOverride,
  setCamera, toggleWave, toggleTelescope, togglePhysics,
}
```

---

## 7. Build & Dev Commands

```bash
# Install
npm create vite@latest sea-urchin-designer -- --template react
cd sea-urchin-designer
npm install three cannon-es zustand jszip three-stdlib

# Dev server
npm run dev          # localhost:5173

# Production build
npm run build        # outputs dist/

# Lint
npm run lint
```

---

## 8. Key Engineering Constraints

| Constraint | Spec | Why |
|---|---|---|
| Spine count upper limit | 1,200 instanced meshes | WebGL instancing limit before FPS drop |
| STL export max file size | 50MB per zone | Browser memory |
| Minimum spine length | 8mm | Below this, print tolerance makes telescoping impossible |
| Spine base diameter | 6–12mm | Must accept M3 threaded insert |
| Telescope clearance | 0.15mm between segments | PETG tolerance spec for sliding fit |
| Panel connector snap spacing | Every 35mm | Load rating for 24-spine panels |
| Hydro-dip template DPI | 300 minimum | Commercial film print spec |

---

## 9. Milestone Roadmap

| Version | Feature | Owner | Priority |
|---|---|---|---|
| v2.0 | Three.js viewer + OrbitControls | Agent | P0 |
| v2.0 | Parametric parka body mesh | Agent | P0 |
| v2.0 | MeshSurfaceSampler spine generation | Agent | P0 |
| v2.1 | Blender/Fusion 360 GLTF pipeline | Agent | P1 |
| v2.1 | STL export (per-zone + merged) | Agent | P1 |
| v2.1 | Auto assembly guide generation | Agent | P1 |
| v2.2 | Cannon-es physics toggle | Agent | P2 |
| v2.2 | Arm movement preview simulation | Agent | P2 |
| v2.3 | Parametric spine array editor | Agent | P2 |
| v2.3 | Zone-level override controls | Agent | P2 |
| v2.4 | Hydro-dip UV template export | Agent | P3 |
| v2.4 | Flag texture back-panel preview | Agent | P3 |
| v2.5 | Collaborative design sharing (URL state) | Agent | P3 |

---

## 10. Reference Files

| File | Purpose |
|---|---|
| `sea-urchin-parka-v3.html` | Current working prototype — Canvas 2.5D |
| `sea-urchin-parka-manual.md` | Full construction manual with measurements |
| `ai-sea-urchin-designer.html` | v1 prototype — 2D silhouette reference |
| `hydro-dipping-designer.html` | Hydro-dip template tool |
| Image 1 (parka photo) | Anatomical reference — silhouette, collar, zones |
| Image 2 (sea urchin photo) | Spine distribution reference — S. purpuratus |

---

## 11. Design Intent Summary (Non-Technical)

> The Sea Urchin Parka is a biomimetic wearable garment designed entirely from 3D-printed collapsible PETG spines arranged to mimic the radial spine distribution of a purple sea urchin (*Strongylocentrotus purpuratus*). The parka anatomy follows a standard long-line parka silhouette (Image 1) with hood, fur collar, chest, sleeves, and lower body panels. Every surface of the garment — including sleeves and hood — is covered in spines pointing outward from the body surface at varying angles. Spines are telescoping (3 segments, collapse from 45mm to 20mm). The back panel features a flag design applied via water transfer printing (hydro-dipping). The garment assembles from 6 modular snap-on panels for washing and replacement. Target total spine count: 400–600. Estimated material cost: $250 USD. Estimated print time: 320h distributed across multiple printers.

---

*This spec was generated from the project conversation and existing prototype files. An AI agent implementing this spec should reference `sea-urchin-parka-v3.html` for the current working logic before rebuilding in Three.js.*
