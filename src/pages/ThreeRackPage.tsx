import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AlertTriangle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

type CameraPreset = 'overview' | 'fiber' | 'compute' | 'isometric';
type FinishTheme = 'obsidian' | 'titanium' | 'cobalt';

const FINISH_COLORS: Record<
  FinishTheme,
  { label: string; frameHex: number; accentHex: number; bladeHex: number }
> = {
  obsidian: {
    label: 'Obsidian NOC',
    frameHex: 0x161c26,
    accentHex: 0x0284c7,
    bladeHex: 0x263142,
  },
  titanium: {
    label: 'Titanium Studio',
    frameHex: 0x525d6d,
    accentHex: 0x0369a1,
    bladeHex: 0x6b7788,
  },
  cobalt: {
    label: 'Cobalt Edge',
    frameHex: 0x13223b,
    accentHex: 0x0ea5e9,
    bladeHex: 0x1e3354,
  },
};

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#a0aab8';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y++) {
    const shade = 148 + Math.floor(Math.sin(y * 0.45) * 12 + (Math.random() - 0.5) * 20);
    ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 9})`;
    ctx.fillRect(0, y, 256, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createVentGrilleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#090d14';
  for (let y = 8; y < 256; y += 16) {
    for (let x = 8; x < 256; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 5);
  return tex;
}

export function ThreeRackPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [explode, setExplode] = useState(0);
  const [finish, setFinish] = useState<FinishTheme>('obsidian');
  const [preset, setPreset] = useState<CameraPreset>('overview');
  const [autoRotate, setAutoRotate] = useState(true);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const explodeTargetRef = useRef(0);
  const finishRef = useRef<FinishTheme>('obsidian');
  const autoRotateRef = useRef(true);
  const applyPresetRef = useRef<((p: CameraPreset) => void) | null>(null);
  const applyFinishRef = useRef<((f: FinishTheme) => void) | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    explodeTargetRef.current = explode;
    requestRenderRef.current?.();
  }, [explode]);

  useEffect(() => {
    finishRef.current = finish;
    applyFinishRef.current?.(finish);
    requestRenderRef.current?.();
  }, [finish]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    requestRenderRef.current?.();
  }, [autoRotate]);

  const handleSelectPreset = useCallback((p: CameraPreset) => {
    setPreset(p);
    applyPresetRef.current?.(p);
    requestRenderRef.current?.();
  }, []);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL hardware/software acceleration is unavailable in this browser.');
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl = /swiftshader|llvmpipe|software rasterizer/i.test(rendererStr);

    const width = Math.max(mount.clientWidth, 320);
    const height = Math.max(mount.clientHeight, 320);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('WebGL rendering context paused. Restore tab focus or reload view.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.2, 2.2, 4.1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.15, 0);
    controls.minDistance = 2.1;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.49;

    // 3-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xcbe4ff, 0x1e293b, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.1);
    keyLight.position.set(3.5, 5.2, 4.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-4.0, 3.2, -3.5);
    scene.add(rimLight);

    // Procedural Textures
    const brushedTex = createBrushedMetalTexture();
    const ventTex = createVentGrilleTexture();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    brushedTex.anisotropy = Math.min(4, maxAniso);
    ventTex.anisotropy = Math.min(4, maxAniso);

    // Grounded Floor & Plinth
    const floorGeo = new THREE.CircleGeometry(9, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.78,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(12, 24, 0x1e3a5f, 0x162238);
    gridHelper.position.y = 0.004;
    scene.add(gridHelper);

    // Materials updated dynamically by Finish Switcher
    const frameMat = new THREE.MeshStandardMaterial({
      color: FINISH_COLORS[finishRef.current].frameHex,
      map: brushedTex,
      roughness: 0.42,
      metalness: 0.82,
    });

    const bladeMat = new THREE.MeshStandardMaterial({
      color: FINISH_COLORS[finishRef.current].bladeHex,
      map: brushedTex,
      roughness: 0.36,
      metalness: 0.78,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: FINISH_COLORS[finishRef.current].accentHex,
      emissive: FINISH_COLORS[finishRef.current].accentHex,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.35,
    });

    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: ventTex,
      roughness: 0.68,
      metalness: 0.55,
    });

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0x1e2530,
      roughness: 0.72,
      metalness: 0.15,
    });

    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.22,
      roughness: 0.08,
      metalness: 0.05,
      ior: 1.5,
      reflectivity: 0.8,
    });

    const ledGreenMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    const ledAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.1,
      roughness: 0.2,
    });

    // Main Assembly Group (ESK 42U Core Cabinet)
    const rackRoot = new THREE.Group();
    scene.add(rackRoot);

    const geometries: THREE.BufferGeometry[] = [floorGeo];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };

    // 1. Heavy Steel Plinth Base
    const plinth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 0.12, 1.24)), ceramicMat);
    plinth.position.set(0, 0.06, 0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    rackRoot.add(plinth);

    // 2. Four Vertical Corner Rails + Top/Bottom Caps
    const postGeo = trackGeo(new THREE.BoxGeometry(0.08, 2.24, 0.08));
    const postOffsets: [number, number][] = [
      [-0.5, -0.52],
      [0.5, -0.52],
      [-0.5, 0.52],
      [0.5, 0.52],
    ];
    postOffsets.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeo, frameMat);
      post.position.set(px, 1.24, pz);
      post.castShadow = true;
      rackRoot.add(post);
    });

    const topCap = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.16, 0.09, 1.2)), frameMat);
    topCap.position.set(0, 2.4, 0);
    topCap.castShadow = true;
    rackRoot.add(topCap);

    // 3. Perforated Side & Rear Enclosure Panels
    const sidePanelGeo = trackGeo(new THREE.BoxGeometry(0.03, 2.16, 1.04));
    const leftPanel = new THREE.Mesh(sidePanelGeo, grilleMat);
    leftPanel.position.set(-0.54, 1.24, 0);
    rackRoot.add(leftPanel);

    const rightPanel = new THREE.Mesh(sidePanelGeo, grilleMat);
    rightPanel.position.set(0.54, 1.24, 0);
    rackRoot.add(rightPanel);

    const backPanel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.06, 2.16, 0.03)),
      grilleMat
    );
    backPanel.position.set(0, 1.24, -0.54);
    rackRoot.add(backPanel);

    // 4. Explodable Internal Blades Array
    const slideTargets: { obj: THREE.Object3D; baseZ: number; factor: number }[] = [];

    // 4a. Top Core Fiber Patch Panel (y = 2.08)
    const fiberGroup = new THREE.Group();
    fiberGroup.position.set(0, 2.08, 0.02);
    const fiberBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.14, 0.86)), bladeMat);
    fiberBody.castShadow = true;
    fiberGroup.add(fiberBody);

    const sfpGeo = trackGeo(new THREE.BoxGeometry(0.035, 0.025, 0.04));
    const sfpInst = new THREE.InstancedMesh(sfpGeo, accentMat, 16);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 16; i++) {
      dummy.position.set(-0.34 + i * 0.045, 0.02, 0.44);
      dummy.updateMatrix();
      sfpInst.setMatrixAt(i, dummy.matrix);
    }
    fiberGroup.add(sfpInst);
    rackRoot.add(fiberGroup);
    slideTargets.push({ obj: fiberGroup, baseZ: 0.02, factor: 0.48 });

    // 4b. Dual BGP Multi-WAN Core Routers (y = 1.82 & 1.66)
    [1.82, 1.66].forEach((ry, idx) => {
      const routerGroup = new THREE.Group();
      routerGroup.position.set(0, ry, 0.02);
      const chassis = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.11, 0.88)), bladeMat);
      chassis.castShadow = true;
      routerGroup.add(chassis);

      const ledBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.018, 0.02)), ledGreenMat);
      ledBar.position.set(-0.22, 0.02, 0.45);
      routerGroup.add(ledBar);

      const wanTag = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.035, 0.02)), accentMat);
      wanTag.position.set(0.26, 0, 0.45);
      routerGroup.add(wanTag);

      rackRoot.add(routerGroup);
      slideTargets.push({ obj: routerGroup, baseZ: 0.02, factor: 0.65 + idx * 0.12 });
    });

    // 4c. 24-Port PoE++ Distribution Switch (y = 1.44)
    const switchGroup = new THREE.Group();
    switchGroup.position.set(0, 1.44, 0.02);
    const switchBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.18, 0.9)), bladeMat);
    switchBody.castShadow = true;
    switchGroup.add(switchBody);

    const portGeo = trackGeo(new THREE.BoxGeometry(0.028, 0.028, 0.025));
    const portInst = new THREE.InstancedMesh(portGeo, ledGreenMat, 24);
    for (let i = 0; i < 24; i++) {
      const col = i % 12;
      const row = Math.floor(i / 12);
      dummy.position.set(-0.34 + col * 0.058, row === 0 ? 0.03 : -0.02, 0.46);
      dummy.updateMatrix();
      portInst.setMatrixAt(i, dummy.matrix);
    }
    switchGroup.add(portInst);
    rackRoot.add(switchGroup);
    slideTargets.push({ obj: switchGroup, baseZ: 0.02, factor: 0.9 });

    // 4d. NVMe Compute & Paynow/EcoCash Ledger Nodes (y = 1.12 & 0.86)
    [1.12, 0.86].forEach((cy, idx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(0, cy, 0.02);
      const body = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.2, 0.92)), frameMat);
      body.castShadow = true;
      nodeGroup.add(body);

      const bayGeo = trackGeo(new THREE.BoxGeometry(0.095, 0.14, 0.03));
      const bayInst = new THREE.InstancedMesh(bayGeo, ceramicMat, 6);
      for (let b = 0; b < 6; b++) {
        dummy.position.set(-0.31 + b * 0.115, 0, 0.47);
        dummy.updateMatrix();
        bayInst.setMatrixAt(b, dummy.matrix);
      }
      nodeGroup.add(bayInst);

      const statusLed = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.04, 0.02, 0.02)),
        idx === 0 ? ledGreenMat : ledAmberMat
      );
      statusLed.position.set(0.36, 0.05, 0.47);
      nodeGroup.add(statusLed);

      rackRoot.add(nodeGroup);
      slideTargets.push({ obj: nodeGroup, baseZ: 0.02, factor: 0.55 - idx * 0.15 });
    });

    // 4e. Dual Online UPS Battery Stack (y = 0.42)
    const upsGroup = new THREE.Group();
    upsGroup.position.set(0, 0.42, 0.02);
    const upsBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.46, 0.94)), ceramicMat);
    upsBody.castShadow = true;
    upsGroup.add(upsBody);

    const upsDisplay = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.08, 0.025)), accentMat);
    upsDisplay.position.set(-0.22, 0.08, 0.48);
    upsGroup.add(upsDisplay);
    rackRoot.add(upsGroup);
    slideTargets.push({ obj: upsGroup, baseZ: 0.02, factor: 0.28 });

    // 5. Armored Fiber Optic & Cat6A Patch Cables (TubeGeometry)
    const fiberCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, 2.08, 0.48),
      new THREE.Vector3(-0.46, 1.92, 0.54),
      new THREE.Vector3(-0.44, 1.66, 0.52),
      new THREE.Vector3(-0.34, 1.46, 0.49),
    ]);
    const fiberCableMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.38,
      metalness: 0.1,
    });
    const fiberCable = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(fiberCurve, 28, 0.012, 8, false)),
      fiberCableMat
    );
    rackRoot.add(fiberCable);
    slideTargets.push({ obj: fiberCable, baseZ: 0, factor: 0.5 });

    const catCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.32, 1.82, 0.48),
      new THREE.Vector3(0.45, 1.64, 0.55),
      new THREE.Vector3(0.43, 1.44, 0.51),
      new THREE.Vector3(0.32, 1.15, 0.5),
    ]);
    const catCable = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(catCurve, 28, 0.013, 8, false)),
      accentMat
    );
    rackRoot.add(catCable);
    slideTargets.push({ obj: catCable, baseZ: 0, factor: 0.5 });

    // 6. Front Hinged Physical Polycarbonate Door
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.5, 1.24, 0.57);
    const glassPane = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.96, 2.1, 0.018)),
      doorGlassMat
    );
    glassPane.position.set(0.5, 0, 0);
    doorPivot.add(glassPane);

    const doorHandle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.035, 0.24, 0.03)),
      frameMat
    );
    doorHandle.position.set(0.92, 0, 0.022);
    doorPivot.add(doorHandle);
    rackRoot.add(doorPivot);

    // Camera preset targets & damped transition state
    const desiredCamPos = new THREE.Vector3(3.2, 2.2, 4.1);
    const desiredTarget = new THREE.Vector3(0, 1.15, 0);
    let presetActive = false;

    const PRESET_MAP: Record<
      CameraPreset,
      { pos: [number, number, number]; target: [number, number, number] }
    > = {
      overview: { pos: [3.2, 2.2, 4.1], target: [0, 1.15, 0] },
      fiber: { pos: [1.3, 1.95, 2.2], target: [0, 1.78, 0.2] },
      compute: { pos: [-1.4, 1.05, 2.45], target: [0, 0.92, 0.2] },
      isometric: { pos: [3.6, 2.8, -2.9], target: [0, 1.15, 0] },
    };

    applyPresetRef.current = (p: CameraPreset) => {
      const cfg = PRESET_MAP[p];
      desiredCamPos.set(...cfg.pos);
      desiredTarget.set(...cfg.target);
      presetActive = true;
    };

    applyFinishRef.current = (f: FinishTheme) => {
      const cfg = FINISH_COLORS[f];
      frameMat.color.setHex(cfg.frameHex);
      bladeMat.color.setHex(cfg.bladeHex);
      accentMat.color.setHex(cfg.accentHex);
      accentMat.emissive.setHex(cfg.accentHex);
    };

    const stopPresetOnInteract = () => {
      presetActive = false;
    };
    controls.addEventListener('start', stopPresetOnInteract);

    let explodeCurrent = 0;
    let rafId = 0;
    let prevTime = performance.now();

    function requestRender() {
      // rAF loop runs smoothly with delta pacing
    }
    requestRenderRef.current = requestRender;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      // Exponential smoothing for exploded rack layers & front door swing
      const lerpAlpha = 1 - Math.exp(-8 * dt);
      explodeCurrent += (explodeTargetRef.current - explodeCurrent) * lerpAlpha;

      slideTargets.forEach((item) => {
        item.obj.position.z = item.baseZ + explodeCurrent * item.factor;
      });
      doorPivot.rotation.y = -explodeCurrent * 1.15;

      if (presetActive) {
        camera.position.lerp(desiredCamPos, 1 - Math.exp(-5 * dt));
        controls.target.lerp(desiredTarget, 1 - Math.exp(-5 * dt));
        if (camera.position.distanceTo(desiredCamPos) < 0.02) {
          presetActive = false;
        }
      } else if (autoRotateRef.current) {
        rackRoot.rotation.y += dt * 0.16;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 300);
        const h = Math.max(entry.contentRect.height, 300);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', stopPresetOnInteract);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      geometries.forEach((g) => g.dispose());
      [
        floorMat,
        frameMat,
        bladeMat,
        accentMat,
        grilleMat,
        ceramicMat,
        doorGlassMat,
        ledGreenMat,
        ledAmberMat,
        fiberCableMat,
      ].forEach((m) => m.dispose());
      brushedTex.dispose();
      ventTex.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] min-h-[580px] bg-slate-950 overflow-hidden select-none">
      {/* Three.js Isolated Mount Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top-Left Semantic Architectural Title Overlay */}
      <div className="absolute top-4 left-4 z-10 max-w-sm bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-white pointer-events-auto">
        <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">
          ESK Hardware Lab · Interactive 3D CAD
        </div>
        <h1 className="font-display text-lg font-bold tracking-tight mt-0.5">
          42U Enterprise Core &amp; Fibre Cabinet
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Drag to orbit · Scroll to zoom · Press{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono">
            H
          </kbd>{' '}
          to toggle controls dock
        </p>
      </div>

      {/* WebGL Context Error Fallback */}
      {webglError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/95 p-6">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span>3D Viewport Paused</span>
            </div>
            <p className="text-sm text-slate-300">{webglError}</p>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Compact <=15% height, NO backdrop-filter over WebGL) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(94vw,860px)] pointer-events-auto">
        <div className="bg-slate-950/92 border border-slate-800 rounded-xl text-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80">
            <span className="text-xs font-mono text-slate-300">
              Cabinet Inspection Controls · BGP / PoE++ / NVMe / Online UPS
            </span>
            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              <span>{dockCollapsed ? 'Expand' : 'Minimize (H)'}</span>
              {dockCollapsed ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {!dockCollapsed && (
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Exploded View Slider */}
              <div className="md:col-span-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="rack-explode" className="text-slate-300 font-medium">
                    Exploded Layer Pullout
                  </label>
                  <span className="font-mono text-sky-400 tabular-nums">
                    {Math.round(explode * 100)}%
                  </span>
                </div>
                <input
                  id="rack-explode"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explode}
                  onChange={(e) => setExplode(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Camera Presets */}
              <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ['overview', 'Overview'],
                    ['fiber', 'Fibre & BGP'],
                    ['compute', 'NVMe & UPS'],
                    ['isometric', 'Rear ISO'],
                  ] as [CameraPreset, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectPreset(id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      preset === id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Finish & Spin Controls */}
              <div className="md:col-span-3 flex items-center justify-end gap-2">
                <select
                  aria-label="Rack chassis finish"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as FinishTheme)}
                  className="px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {(Object.keys(FINISH_COLORS) as FinishTheme[]).map((k) => (
                    <option key={k} value={k}>
                      {FINISH_COLORS[k].label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  title="Toggle cabinet rotation"
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer ${
                    autoRotate
                      ? 'bg-sky-700 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{autoRotate ? 'Spin' : 'Static'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
