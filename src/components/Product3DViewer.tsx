import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Layers, RotateCcw } from 'lucide-react';
import {
  clampExplodeAmount,
  PRODUCT_3D_SPECS,
  type Product3DArchetype,
} from '../utils/product3dSpecs';
import { buildProduct3DModel } from '../three/buildProductModel';
import { createProceduralTexturePack } from '../three/proceduralTextures';

interface Product3DViewerProps {
  archetype: Product3DArchetype;
}

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function Product3DViewer({ archetype }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [explodeTarget, setExplodeTarget] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const explodeTargetRef = useRef(0);
  const resetCameraRef = useRef<(() => void) | null>(null);
  const triggerRenderRef = useRef<(() => void) | null>(null);

  const spec = PRODUCT_3D_SPECS[archetype];

  useEffect(() => {
    explodeTargetRef.current = clampExplodeAmount(explodeTarget);
    triggerRenderRef.current?.();
  }, [explodeTarget]);

  useEffect(() => {
    setExplodeTarget(0);
    explodeTargetRef.current = 0;
  }, [archetype]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let explodeCurrent = 0;
    let isResettingCamera = false;
    let lastTimestamp = performance.now();

    const isSoftwareGl = detectSoftwareWebGL();
    const currentSpec = PRODUCT_3D_SPECS[archetype];

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    setWebglFailed(false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialWidth = Math.max(container.clientWidth, 320);
    const initialHeight = Math.max(container.clientHeight, 320);
    renderer.setSize(initialWidth, initialHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0xe6eff6;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.Fog(bgHex, 7.5, 16.5);

    const camera = new THREE.PerspectiveCamera(
      36,
      initialWidth / initialHeight,
      0.1,
      40,
    );
    camera.position.set(...currentSpec.cameraPosition);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Warm Key + Cool Hemisphere Fill + Subtle Rim (Balanced Studio Rig)
    const hemiLight = new THREE.HemisphereLight(0xcbe3f5, 0x223645, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e2, 2.15);
    keyLight.position.set(3.8, 5.4, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.8;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa8d1e7, 0.85);
    rimLight.position.set(-4.0, 2.8, -3.5);
    scene.add(rimLight);

    // Procedural Textures + Multi-part Composite Hardware Model
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const texturePack = createProceduralTexturePack(maxAniso);
    const builtModel = buildProduct3DModel(archetype, texturePack, isSoftwareGl);
    scene.add(builtModel.root);

    // Grounded Studio Turntable Plinth + Soft Radial Contact Shadow Disc
    const plinthGeo = new THREE.CylinderGeometry(1.48, 1.56, 0.06, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xd9e6f0,
      roughness: 0.72,
      metalness: 0.08,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.03;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const ringGeo = new THREE.RingGeometry(1.36, 1.41, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x285e7b,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const plinthRing = new THREE.Mesh(ringGeo, ringMat);
    plinthRing.rotation.x = -Math.PI / 2;
    plinthRing.position.y = 0.012;
    scene.add(plinthRing);

    const shadowPlaneGeo = new THREE.CircleGeometry(1.26, 36);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: texturePack.contactShadowAlpha,
      transparent: true,
      depthWrite: false,
      opacity: 0.48,
    });
    const contactShadow = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.022;
    scene.add(contactShadow);

    // OrbitControls — Smooth Damping on GPU, Direct On-Demand on Software WebGL
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...currentSpec.cameraTarget);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.8;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTimestamp) / 1000));
        lastTimestamp = now;

        let needsAnotherFrame = false;

        // Smoothly damp exploded-view separation
        const targetExplode = explodeTargetRef.current;
        if (Math.abs(explodeCurrent - targetExplode) > 0.0015) {
          explodeCurrent = isSoftwareGl
            ? targetExplode
            : THREE.MathUtils.damp(explodeCurrent, targetExplode, 9, dt);
          if (Math.abs(explodeCurrent - targetExplode) <= 0.002) {
            explodeCurrent = targetExplode;
          } else {
            needsAnotherFrame = true;
          }
          for (const part of builtModel.parts) {
            part.object.position
              .copy(part.basePosition)
              .addScaledVector(part.explodeDelta, explodeCurrent);
          }
        }

        // Smooth camera reset transition (cancelled immediately on user control start)
        if (isResettingCamera) {
          _targetPos.set(...currentSpec.cameraPosition);
          _targetLook.set(...currentSpec.cameraTarget);
          if (isSoftwareGl) {
            camera.position.copy(_targetPos);
            controls.target.copy(_targetLook);
            isResettingCamera = false;
          } else {
            const alpha = 1 - Math.exp(-8 * dt);
            camera.position.lerp(_targetPos, alpha);
            controls.target.lerp(_targetLook, alpha);
            if (
              camera.position.distanceTo(_targetPos) < 0.01 &&
              controls.target.distanceTo(_targetLook) < 0.01
            ) {
              camera.position.copy(_targetPos);
              controls.target.copy(_targetLook);
              isResettingCamera = false;
            } else {
              needsAnotherFrame = true;
            }
          }
        }

        const controlsChanged = controls.update();
        if (controlsChanged && !isSoftwareGl) {
          needsAnotherFrame = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || needsAnotherFrame)) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    triggerRenderRef.current = requestRender;
    resetCameraRef.current = () => {
      isResettingCamera = true;
      requestRender();
    };

    const handleControlsChange = () => requestRender();
    const handleControlsStart = () => {
      isResettingCamera = false;
    };
    controls.addEventListener('change', handleControlsChange);
    controls.addEventListener('start', handleControlsStart);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(Math.floor(entry.contentRect.width), 240);
        const h = Math.max(Math.floor(entry.contentRect.height), 240);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    requestRender();
    setReady(true);

    return () => {
      disposed = true;
      setReady(false);
      triggerRenderRef.current = null;
      resetCameraRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('change', handleControlsChange);
      controls.removeEventListener('start', handleControlsStart);
      controls.dispose();

      for (const g of builtModel.geometries) g.dispose();
      for (const m of builtModel.materials) m.dispose();
      for (const t of texturePack.textures) t.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [archetype]);

  if (webglFailed) {
    return (
      <div className="flex h-full min-h-[340px] w-full flex-col items-center justify-center bg-[#E6EFF6] p-6 text-center text-sm text-[#425663]">
        <p className="font-semibold text-[#0D2534]">
          Visualização 3D indisponível neste dispositivo.
        </p>
        <p className="mt-1 text-xs">
          Use a aba Foto oficial para conferir o produto em alta definição.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-3d-canvas"
      data-3d-ready={ready ? 'true' : 'false'}
      data-archetype={archetype}
      className="relative h-full min-h-[360px] w-full select-none overflow-hidden bg-[#E6EFF6] lg:min-h-[460px]"
    >
      {/* Dedicated Empty Ref Container for WebGL Canvas */}
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top-Left Studio Spec Pill (Solid tinted rgba — zero backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 max-w-[78%] rounded-xl border border-[#16394E]/15 bg-[rgba(255,255,255,0.92)] px-3 py-2 shadow-sm">
        <p className="font-display text-xs font-bold leading-tight text-[#0D2534]">
          {spec.title}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-[#425663]">
          Arraste para girar · Role para aproximar
        </p>
      </div>

      {/* Collapsible Bottom Control Dock (Solid rgba surface — zero backdrop-filter over WebGL) */}
      <div className="absolute inset-x-3 bottom-3 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          aria-expanded={!dockCollapsed}
          aria-label={
            dockCollapsed ? 'Mostrar controles 3D' : 'Ocultar controles 3D'
          }
          className="mb-1 inline-flex items-center gap-1 rounded-full border border-white/15 bg-[rgba(11,34,49,0.92)] px-2.5 py-0.5 text-[10px] font-semibold text-[#D6E8F3] transition-colors hover:bg-[#16394E] hover:text-white"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3 w-3" aria-hidden="true" />
              <span>Controles 3D</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
              <span>Ocultar</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="flex w-full max-w-[390px] flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/14 bg-[rgba(11,34,49,0.94)] px-3.5 py-2.5 text-white shadow-[0_12px_28px_rgba(7,23,34,0.28)]">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setExplodeTarget((prev) => (prev > 0.5 ? 0 : 1))
                }
                aria-pressed={explodeTarget > 0.5}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  explodeTarget > 0.5
                    ? 'bg-[#A8D1E7] text-[#071722]'
                    : 'bg-white/12 text-white hover:bg-white/20'
                }`}
              >
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{explodeTarget > 0.5 ? 'Montar' : 'Explodir'}</span>
              </button>

              <label className="flex min-w-0 flex-1 items-center gap-2">
                <span className="sr-only">Separar peças da vista explodida</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodeTarget * 100)}
                  onChange={(e) =>
                    setExplodeTarget(Number(e.target.value) / 100)
                  }
                  aria-label="Separar peças em vista explodida"
                  className="h-1.5 w-full cursor-pointer accent-[#A8D1E7]"
                />
                <span className="w-8 shrink-0 text-right font-mono text-[10px] text-[#C8DFEC] tabular-nums">
                  {Math.round(explodeTarget * 100)}%
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => resetCameraRef.current?.()}
              aria-label="Resetar ângulo da câmera 3D"
              title="Resetar ângulo"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#DCEBF4] transition-colors hover:bg-white/20 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
