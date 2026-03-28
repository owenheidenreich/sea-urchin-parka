/**
 * Viewport.jsx — Three.js WebGL scene with OrbitControls.
 * Uses garment registry to render either gown or parka.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useStore } from '../store/store.js';
import { GARMENT_BUILDERS, GARMENT_PRESETS } from '../engine/garmentRegistry.js';
import { BG_SHADES } from './Toolbar.jsx';

export default function Viewport() {
  const mountRef     = useRef(null);
  const sceneRef     = useRef(null);
  const rendRef      = useRef(null);
  const camRef       = useRef(null);
  const ctrlRef      = useRef(null);
  const rafRef       = useRef(null);
  const mannequinRef = useRef(null);
  const garmentRef   = useRef(null);
  const ammoRef      = useRef(null);
  const medallionRef = useRef(null);
  const wheelsRef    = useRef(null);
  const axesRef      = useRef(null);
  const groundRef    = useRef(null);

  const activeGarment = useStore((s) => s.activeGarment);
  const showMannequin = useStore((s) => s.showMannequin);
  const showWireframe = useStore((s) => s.showWireframe);
  const showMedallion = useStore((s) => s.showMedallion);
  const showAmmo      = useStore((s) => s.showAmmo);
  const showWheels    = useStore((s) => s.showWheels);
  const showAxes      = useStore((s) => s.showAxes);
  const cameraPreset  = useStore((s) => s.cameraPreset);
  const bgShade       = useStore((s) => s.bgShade);

  // Shared ammo params
  const ammoCount   = useStore((s) => s.ammoCount);
  const ammoSizeMin = useStore((s) => s.ammoSizeMin);
  const ammoSizeMax = useStore((s) => s.ammoSizeMax);
  const ammoSpread  = useStore((s) => s.ammoSpread);
  const flatRatio   = useStore((s) => s.flatRatio);
  const layerCount  = useStore((s) => s.layerCount);
  const themeKey    = useStore((s) => s.themeKey);

  // Garment-specific params (subscribe to entire sub-object)
  const gownParams  = useStore((s) => s.gown);
  const parkaParams = useStore((s) => s.parka);

  // ── Scene init ──
  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.004);
    sceneRef.current = scene;

    // Camera
    const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 500);
    const initPreset = GARMENT_PRESETS[useStore.getState().activeGarment]['3/4'];
    cam.position.set(...initPreset.pos);
    cam.lookAt(...initPreset.tgt);
    camRef.current = cam;

    // Controls
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 200;
    controls.target.set(...initPreset.tgt);
    controls.enablePan = true;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    controls.update();
    ctrlRef.current = controls;

    // ── Lighting ──
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(-30, 60, 40);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffddcc, 0.45);
    fill.position.set(40, 0, -20);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4488ff, 0.85);
    rim.position.set(0, 50, -50);
    scene.add(rim);

    const under = new THREE.DirectionalLight(0x6644aa, 0.3);
    under.position.set(0, -20, 30);
    scene.add(under);

    scene.add(new THREE.AmbientLight(0x182030, 0.5));

    // ── Environment for fabric reflections ──
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x182848);
    const envSphereGeo = new THREE.SphereGeometry(100, 16, 16);
    const envTop = new THREE.Mesh(envSphereGeo, new THREE.MeshBasicMaterial({
      color: 0x2244aa, side: THREE.BackSide,
    }));
    envScene.add(envTop);
    const envRT = pmremGen.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    pmremGen.dispose();

    // ── Ground plane ──
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a, roughness: 1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -33;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;

    // ── XYZ Axis helper ──
    const axesGroup = buildAxesHelper();
    scene.add(axesGroup);
    axesRef.current = axesGroup;

    // ── Build initial scene ──
    rebuildScene(scene);

    // ── Resize ──
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    });
    ro.observe(mount);

    // ── Animate ──
    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, cam);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild when garment or params change ──
  useEffect(() => {
    if (!sceneRef.current) return;
    rebuildScene(sceneRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGarment,
      ammoCount, ammoSizeMin, ammoSizeMax, ammoSpread, flatRatio, layerCount, themeKey,
      gownParams, parkaParams]);

  // ── Tween camera when switching garments ──
  useEffect(() => {
    if (!camRef.current || !ctrlRef.current) return;
    const presets = GARMENT_PRESETS[activeGarment];
    if (!presets) return;
    const p = presets['3/4'];
    tweenCamera(camRef.current, ctrlRef.current, p.pos, p.tgt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGarment]);

  // ── Mannequin visibility ──
  useEffect(() => {
    if (mannequinRef.current) mannequinRef.current.visible = showMannequin;
  }, [showMannequin]);

  // ── Medallion visibility ──
  useEffect(() => {
    if (medallionRef.current) medallionRef.current.visible = showMedallion;
  }, [showMedallion]);

  // ── Ammo visibility ──
  useEffect(() => {
    if (ammoRef.current) ammoRef.current.visible = showAmmo;
  }, [showAmmo]);

  // ── Wheels visibility ──
  useEffect(() => {
    if (wheelsRef.current) wheelsRef.current.visible = showWheels;
  }, [showWheels]);

  // ── Axes visibility ──
  useEffect(() => {
    if (axesRef.current) axesRef.current.visible = showAxes;
  }, [showAxes]);

  // ── Wireframe toggle ──
  useEffect(() => {
    if (!garmentRef.current) return;
    garmentRef.current.traverse((child) => {
      if (child.isMesh && child.material) child.material.wireframe = showWireframe;
    });
  }, [showWireframe]);

  // ── Background shade ──
  useEffect(() => {
    if (!sceneRef.current) return;
    const color = new THREE.Color(BG_SHADES[bgShade] || BG_SHADES[0]);
    sceneRef.current.background = color;
    sceneRef.current.fog = new THREE.FogExp2(color.getHex(), 0.004);
    if (groundRef.current) groundRef.current.material.color.copy(color);
  }, [bgShade]);

  // ── Camera preset ──
  useEffect(() => {
    if (!camRef.current || !ctrlRef.current) return;
    const presets = GARMENT_PRESETS[activeGarment];
    const p = presets?.[cameraPreset];
    if (!p) return;
    tweenCamera(camRef.current, ctrlRef.current, p.pos, p.tgt);
  }, [cameraPreset, activeGarment]);

  function rebuildScene(scene) {
    // Dispose old objects
    if (garmentRef.current) {
      scene.remove(garmentRef.current);
      garmentRef.current.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    if (ammoRef.current) {
      scene.remove(ammoRef.current);
      ammoRef.current.geometry?.dispose();
      ammoRef.current.material?.dispose();
    }
    if (wheelsRef.current) {
      scene.remove(wheelsRef.current);
      wheelsRef.current.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    if (mannequinRef.current) scene.remove(mannequinRef.current);
    if (medallionRef.current) {
      scene.remove(medallionRef.current);
      medallionRef.current.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }

    // Build using registry
    const state = useStore.getState();
    const builder = GARMENT_BUILDERS[state.activeGarment];
    if (!builder) return;

    const result = builder(state);

    // Add to scene
    scene.add(result.garmentGroup);
    garmentRef.current = result.garmentGroup;

    scene.add(result.mannequin);
    mannequinRef.current = result.mannequin;

    if (result.ammoMesh) {
      scene.add(result.ammoMesh);
      ammoRef.current = result.ammoMesh;
    } else {
      ammoRef.current = null;
    }

    if (result.wheels) {
      scene.add(result.wheels);
      wheelsRef.current = result.wheels;
    } else {
      wheelsRef.current = null;
    }

    if (result.medallion) {
      scene.add(result.medallion);
      medallionRef.current = result.medallion;
    } else {
      medallionRef.current = null;
    }
  }

  return (
    <div ref={mountRef} className="w-full h-full" style={{ background: '#0a0e1a' }} />
  );
}

function buildAxesHelper() {
  const group = new THREE.Group();
  group.name = 'axesHelper';
  const LEN = 18;

  const axes = [
    { dir: [LEN, 0, 0], color: 0xff3333, label: 'X' },
    { dir: [0, LEN, 0], color: 0x33cc33, label: 'Y' },
    { dir: [0, 0, LEN], color: 0x3388ff, label: 'Z' },
  ];

  for (const { dir, color, label } of axes) {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...dir)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    group.add(new THREE.Line(lineGeo, lineMat));

    const coneGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(...dir);
    if (label === 'X') cone.rotation.z = -Math.PI / 2;
    else if (label === 'Z') cone.rotation.x = Math.PI / 2;
    group.add(cone);

    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 48px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 32, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.5, 2.5, 1);
    sprite.position.set(
      dir[0] + (dir[0] ? 2.5 : 0),
      dir[1] + (dir[1] ? 2.5 : 0),
      dir[2] + (dir[2] ? 2.5 : 0),
    );
    group.add(sprite);
  }

  const originGeo = new THREE.SphereGeometry(0.4, 10, 10);
  const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  group.add(new THREE.Mesh(originGeo, originMat));

  group.position.set(0, 0, 0);
  return group;
}

function tweenCamera(cam, controls, targetPos, targetTgt) {
  const startPos = cam.position.clone();
  const startTgt = controls.target.clone();
  const endPos   = new THREE.Vector3(...targetPos);
  const endTgt   = new THREE.Vector3(...targetTgt);
  const dur = 600;
  const start = performance.now();

  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    cam.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTgt, endTgt, ease);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
