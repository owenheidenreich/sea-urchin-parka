/**
 * Viewport.jsx — Three.js WebGL scene with OrbitControls.
 * Renders mannequin + parka body + hood + sleeves + details + ammunition.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildMannequin } from '../engine/Mannequin.js';
import { buildParkaBody } from '../engine/ParkaBody.js';
import { buildParkaHood } from '../engine/ParkaHood.js';
import { buildParkaSleeves } from '../engine/ParkaSleeves.js';
import { buildParkaDetails } from '../engine/ParkaDetails.js';
import { buildAmmoInstances } from '../engine/AmmoPlacement.js';
import { buildFlowerMedallion } from '../engine/FlowerMedallion.js';
import { useStore } from '../store/store.js';
import { THEMES } from '../utils/themes.js';
import { BG_SHADES } from './Toolbar.jsx';

const PRESETS = {
  FRONT: { pos: [0, 10, 75],  tgt: [0, 10, 0] },
  BACK:  { pos: [0, 10, -75], tgt: [0, 10, 0] },
  LEFT:  { pos: [-75, 10, 0], tgt: [0, 10, 0] },
  RIGHT: { pos: [75, 10, 0],  tgt: [0, 10, 0] },
  TOP:   { pos: [0, 90, 1],   tgt: [0, 10, 0] },
  '3/4': { pos: [50, 30, 50], tgt: [0, 10, 0] },
};

export default function Viewport() {
  const mountRef     = useRef(null);
  const sceneRef     = useRef(null);
  const rendRef      = useRef(null);
  const camRef       = useRef(null);
  const ctrlRef      = useRef(null);
  const rafRef       = useRef(null);
  const mannequinRef = useRef(null);
  const parkaRef     = useRef(null);
  const ammoRef      = useRef(null);
  const medallionRef = useRef(null);
  const axesRef      = useRef(null);

  const {
    showMannequin, showWireframe, cameraPreset,
    ammoCount, ammoSizeMin, ammoSizeMax, ammoSpread, flatRatio, layerCount, themeKey,
    hoodDepth, bgShade,
    medallionScale, medallionX, medallionY,
  } = useStore();

  const groundRef = useRef(null);

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
    const p = PRESETS['3/4'];
    cam.position.set(...p.pos);
    cam.lookAt(...p.tgt);
    camRef.current = cam;

    // Controls
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 180;
    controls.target.set(0, 10, 0);
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

    const rim = new THREE.DirectionalLight(0x4488ff, 0.55);
    rim.position.set(0, 50, -50);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0x182030, 0.9));

    // ── Ground plane (subtle) ──
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a, roughness: 1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -32;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;

    // ── XYZ Axis helper ──
    const axesGroup = buildAxesHelper();
    scene.add(axesGroup);
    axesRef.current = axesGroup;

    // ── Build scene objects ──
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

  // ── Rebuild when garment params change ──
  useEffect(() => {
    if (!sceneRef.current) return;
    rebuildScene(sceneRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ammoCount, ammoSizeMin, ammoSizeMax, ammoSpread, flatRatio, layerCount, themeKey, hoodDepth, medallionScale, medallionX, medallionY]);

  // ── Mannequin visibility ──
  useEffect(() => {
    if (mannequinRef.current) mannequinRef.current.visible = showMannequin;
  }, [showMannequin]);

  // ── Medallion visibility ──
  const showMedallion = useStore((s) => s.showMedallion);
  useEffect(() => {
    if (medallionRef.current) medallionRef.current.visible = showMedallion;
  }, [showMedallion]);

  // ── Wireframe toggle ──
  useEffect(() => {
    if (!parkaRef.current) return;
    parkaRef.current.traverse((child) => {
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

  // ── Axes visibility ──
  const showAxes = useStore((s) => s.showAxes);
  useEffect(() => {
    if (axesRef.current) axesRef.current.visible = showAxes;
  }, [showAxes]);

  // ── Camera preset ──
  useEffect(() => {
    if (!camRef.current || !ctrlRef.current) return;
    const p = PRESETS[cameraPreset];
    if (!p) return;
    tweenCamera(camRef.current, ctrlRef.current, p.pos, p.tgt);
  }, [cameraPreset]);

  function rebuildScene(scene) {
    // Remove old parka + ammo
    if (parkaRef.current) {
      scene.remove(parkaRef.current);
      parkaRef.current.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    if (ammoRef.current) {
      scene.remove(ammoRef.current);
      ammoRef.current.geometry.dispose();
      ammoRef.current.material.dispose();
    }
    if (mannequinRef.current) scene.remove(mannequinRef.current);

    // Mannequin
    const mannequin = buildMannequin();
    mannequin.visible = useStore.getState().showMannequin;
    scene.add(mannequin);
    mannequinRef.current = mannequin;

    // Parka group
    const parka = new THREE.Group();
    parka.name = 'parka';

    const body = buildParkaBody();
    parka.add(body);

    const hood = buildParkaHood(useStore.getState().hoodDepth);
    parka.add(hood);

    const sleeves = buildParkaSleeves();
    parka.add(sleeves);

    const details = buildParkaDetails();
    parka.add(details);

    scene.add(parka);
    parkaRef.current = parka;

    // Medallion
    if (medallionRef.current) {
      scene.remove(medallionRef.current);
      medallionRef.current.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    const mState = useStore.getState();
    const medallion = buildFlowerMedallion();
    medallion.scale.setScalar(mState.medallionScale);
    medallion.position.set(mState.medallionX, mState.medallionY, 9.8);
    medallion.visible = mState.showMedallion;
    scene.add(medallion);
    medallionRef.current = medallion;

    // Force world matrix update before sampling
    parka.updateMatrixWorld(true);

    // Ammunition
    const T = THEMES[useStore.getState().themeKey] || THEMES.brass;
    const state = useStore.getState();
    const ammoResult = buildAmmoInstances(parka, {
      count: state.ammoCount,
      sizeMin: state.ammoSizeMin,
      sizeMax: state.ammoSizeMax,
      spread: state.ammoSpread,
      flatRatio: state.flatRatio,
      layerCount: state.layerCount,
      theme: T,
    });

    if (ammoResult) {
      scene.add(ammoResult.mesh);
      ammoRef.current = ammoResult.mesh;
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
    // Arrow shaft
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...dir)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    group.add(new THREE.Line(lineGeo, lineMat));

    // Arrowhead cone
    const coneGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(...dir);
    // Orient cone to point along the axis
    if (label === 'X') cone.rotation.z = -Math.PI / 2;
    else if (label === 'Z') cone.rotation.x = Math.PI / 2;
    // Y is default (cone points up)
    group.add(cone);

    // Label sprite
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

  // Origin sphere
  const originGeo = new THREE.SphereGeometry(0.4, 10, 10);
  const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  group.add(new THREE.Mesh(originGeo, originMat));

  // Position at model center
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
