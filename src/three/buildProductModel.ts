import * as THREE from 'three';
import {
  PRODUCT_3D_SPECS,
  type Product3DArchetype,
} from '../utils/product3dSpecs';
import type { ProceduralTexturePack } from './proceduralTextures';

export interface ExplodableAssemblyPart {
  id: string;
  object: THREE.Object3D;
  basePosition: THREE.Vector3;
  explodeDelta: THREE.Vector3;
}

export interface BuiltProductModel {
  root: THREE.Group;
  parts: ExplodableAssemblyPart[];
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
}

function createRoundedRectShape(
  w: number,
  h: number,
  r: number,
): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

export function buildProduct3DModel(
  archetype: Product3DArchetype,
  textures: ProceduralTexturePack,
  isSoftwareGl: boolean,
): BuiltProductModel {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const parts: ExplodableAssemblyPart[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const root = new THREE.Group();
  const spec = PRODUCT_3D_SPECS[archetype];
  const deltaById = new Map(
    spec.parts.map((p) => [p.id, new THREE.Vector3(...p.explodeDelta)]),
  );

  const registerPart = (id: string, object: THREE.Object3D) => {
    root.add(object);
    parts.push({
      id,
      object,
      basePosition: object.position.clone(),
      explodeDelta: deltaById.get(id)?.clone() ?? new THREE.Vector3(),
    });
  };

  if (archetype === 'roller') {
    // ----------------------------------------------------------------------
    // ROMA PINCÉIS — Rolo Antigota Profissional 23cm (10 distinct sub-parts)
    // ----------------------------------------------------------------------
    const microfiberMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.microfiberColor,
        bumpMap: textures.microfiberBump,
        bumpScale: 0.032,
        roughness: 0.92,
        metalness: 0.0,
      }),
    );
    const navyCapMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x16394e,
        roughness: 0.42,
        metalness: 0.08,
      }),
    );
    const steelArmMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd9e2ea,
        roughness: 0.22,
        metalness: 0.92,
      }),
    );
    const redHandleMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xc92525,
        roughness: 0.34,
        metalness: 0.04,
        clearcoat: 0.35,
        clearcoatRoughness: 0.28,
      }),
    );
    const rubberGripMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x16222c,
        roughness: 0.85,
        metalness: 0.02,
      }),
    );

    // Part 1: Microfiber Sleeve Group
    const sleeveGroup = new THREE.Group();
    sleeveGroup.position.set(0.05, 1.48, 0);

    const sleeveBody = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 1.42, 36, 1, false)),
      microfiberMat,
    );
    sleeveBody.rotation.z = Math.PI / 2;
    sleeveBody.castShadow = true;
    sleeveBody.receiveShadow = true;
    sleeveGroup.add(sleeveBody);

    const coreTube = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 1.46, 24)),
      navyCapMat,
    );
    coreTube.rotation.z = Math.PI / 2;
    sleeveGroup.add(coreTube);
    registerPart('sleeve', sleeveGroup);

    // Part 2: End-caps & Cage Retention Rings
    const capsGroup = new THREE.Group();
    capsGroup.position.set(0.05, 1.48, 0);
    const capGeo = trackGeo(new THREE.CylinderGeometry(0.21, 0.23, 0.08, 28));
    const leftCap = new THREE.Mesh(capGeo, navyCapMat);
    leftCap.rotation.z = Math.PI / 2;
    leftCap.position.x = -0.71;
    leftCap.castShadow = true;

    const rightCap = new THREE.Mesh(capGeo, navyCapMat);
    rightCap.rotation.z = Math.PI / 2;
    rightCap.position.x = 0.71;
    rightCap.castShadow = true;

    const endNut = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 0.09, 16)),
      steelArmMat,
    );
    endNut.rotation.z = Math.PI / 2;
    endNut.position.x = 0.78;
    capsGroup.add(leftCap, rightCap, endNut);
    registerPart('caps', capsGroup);

    // Part 3: Galvanized Steel Cage Arm (TubeGeometry along smooth 3D bend)
    const frameGroup = new THREE.Group();
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.75, 1.48, 0),
      new THREE.Vector3(-0.78, 1.48, 0),
      new THREE.Vector3(-0.92, 1.46, 0),
      new THREE.Vector3(-0.92, 1.18, 0),
      new THREE.Vector3(-0.42, 0.96, 0),
      new THREE.Vector3(-0.08, 0.88, 0),
      new THREE.Vector3(-0.08, 0.62, 0),
    ]);
    const armMesh = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(armCurve, 56, 0.042, 14, false)),
      steelArmMat,
    );
    armMesh.castShadow = true;
    frameGroup.add(armMesh);

    const ferrule = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.082, 0.096, 0.14, 24)),
      steelArmMat,
    );
    ferrule.position.set(-0.08, 0.66, 0);
    ferrule.castShadow = true;
    frameGroup.add(ferrule);
    registerPart('frame', frameGroup);

    // Part 4: Ergonomic Lathe Handle with Ribbed Grip & Extension Thread Collar
    const handleGroup = new THREE.Group();
    const lathePts = [
      new THREE.Vector2(0.0, 0.02),
      new THREE.Vector2(0.11, 0.02),
      new THREE.Vector2(0.135, 0.08),
      new THREE.Vector2(0.145, 0.22),
      new THREE.Vector2(0.125, 0.4),
      new THREE.Vector2(0.142, 0.56),
      new THREE.Vector2(0.105, 0.65),
      new THREE.Vector2(0.0, 0.65),
    ];
    const handleBody = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(lathePts, 32)),
      redHandleMat,
    );
    handleBody.position.set(-0.08, 0.0, 0);
    handleBody.castShadow = true;
    handleBody.receiveShadow = true;
    handleGroup.add(handleBody);

    // Soft-touch dark grip rings
    const gripRingGeo = trackGeo(new THREE.TorusGeometry(0.138, 0.014, 10, 28));
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(gripRingGeo, rubberGripMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.08, 0.18 + i * 0.075, 0);
      handleGroup.add(ring);
    }

    // Bottom thread cap
    const baseCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 24)),
      rubberGripMat,
    );
    baseCap.position.set(-0.08, 0.02, 0);
    handleGroup.add(baseCap);
    registerPart('handle', handleGroup);
  } else if (archetype === 'lock') {
    // ----------------------------------------------------------------------
    // SOPRANO — Fechadura Residencial Aço Inox 304 Litoral (11 sub-parts)
    // ----------------------------------------------------------------------
    const brushedInoxMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe3eaef,
        bumpMap: textures.brushedSteelBump,
        bumpScale: 0.008,
        roughness: 0.2,
        metalness: 0.94,
        anisotropy: 0.8,
        anisotropyRotation: Math.PI / 2,
      }),
    );
    const satinChromeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd0dae2,
        roughness: 0.26,
        metalness: 0.9,
      }),
    );
    const brassMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd5a84c,
        roughness: 0.28,
        metalness: 0.88,
      }),
    );
    const mortiseSteelMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x223645,
        roughness: 0.62,
        metalness: 0.55,
      }),
    );
    const gasketMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111920,
        roughness: 0.86,
        metalness: 0.05,
      }),
    );

    // Part 1: Mortise Internal Lock Box + Faceplate + Reversible Latch + Deadbolt
    const mortiseGroup = new THREE.Group();
    const boxMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 1.38, 0.22)),
      mortiseSteelMat,
    );
    boxMesh.position.set(-0.08, 0.84, -0.34);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    mortiseGroup.add(boxMesh);

    // Stainless Faceplate (Testa) on right edge
    const faceplateShape = createRoundedRectShape(0.28, 1.72, 0.07);
    const faceplateGeo = trackGeo(
      new THREE.ExtrudeGeometry(faceplateShape, {
        depth: 0.035,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      }),
    );
    faceplateGeo.center();
    const faceplate = new THREE.Mesh(faceplateGeo, brushedInoxMat);
    faceplate.rotation.y = Math.PI / 2;
    faceplate.position.set(0.42, 0.86, -0.34);
    faceplate.castShadow = true;
    mortiseGroup.add(faceplate);

    // Brass Latch Bolt (Trinco) & Deadbolt (Lingueta)
    const latch = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.22, 0.12)),
      brassMat,
    );
    latch.position.set(0.55, 1.15, -0.34);
    latch.castShadow = true;

    const deadbolt = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.26, 0.34, 0.1)),
      brassMat,
    );
    deadbolt.position.set(0.56, 0.56, -0.34);
    deadbolt.castShadow = true;

    // Square Spindle Bar
    const spindle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.11, 0.92)),
      satinChromeMat,
    );
    spindle.position.set(-0.08, 1.15, -0.02);
    mortiseGroup.add(latch, deadbolt, spindle);
    registerPart('mortise', mortiseGroup);

    // Part 2: Brushed Stainless Escutcheon Plate (Espelho) + Sealing Gasket
    const rosetteGroup = new THREE.Group();
    const escutcheonShape = createRoundedRectShape(0.62, 1.84, 0.14);
    const escutcheonGeo = trackGeo(
      new THREE.ExtrudeGeometry(escutcheonShape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.014,
        bevelSegments: 3,
      }),
    );
    escutcheonGeo.center();
    const escutcheon = new THREE.Mesh(escutcheonGeo, brushedInoxMat);
    escutcheon.position.set(-0.08, 0.92, 0.12);
    escutcheon.castShadow = true;
    escutcheon.receiveShadow = true;
    rosetteGroup.add(escutcheon);

    const gasket = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.56, 1.74, 0.02)),
      gasketMat,
    );
    gasket.position.set(-0.08, 0.92, 0.08);
    rosetteGroup.add(gasket);

    // Top & bottom stainless countersunk screws
    const screwGeo = trackGeo(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 16));
    const topScrew = new THREE.Mesh(screwGeo, satinChromeMat);
    topScrew.rotation.x = Math.PI / 2;
    topScrew.position.set(-0.08, 1.66, 0.16);
    const botScrew = new THREE.Mesh(screwGeo, satinChromeMat);
    botScrew.rotation.x = Math.PI / 2;
    botScrew.position.set(-0.08, 0.18, 0.16);
    rosetteGroup.add(topScrew, botScrew);
    registerPart('rosette', rosetteGroup);

    // Part 3: Brass Multipoint Euro Cylinder Core
    const cylinderGroup = new THREE.Group();
    const cylTop = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.115, 0.115, 0.62, 24)),
      brassMat,
    );
    cylTop.rotation.x = Math.PI / 2;
    cylTop.position.set(-0.08, 0.58, -0.06);
    cylTop.castShadow = true;

    const cylBottom = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.2, 0.62)),
      brassMat,
    );
    cylBottom.position.set(-0.08, 0.45, -0.06);

    const keyhole = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.028, 0.12, 0.04)),
      gasketMat,
    );
    keyhole.position.set(-0.08, 0.56, 0.245);
    cylinderGroup.add(cylTop, cylBottom, keyhole);
    registerPart('cylinder', cylinderGroup);

    // Part 4: Sculpted Stainless Lever Handle + Collar
    const leverGroup = new THREE.Group();
    const collar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 28)),
      satinChromeMat,
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(-0.08, 1.15, 0.19);
    collar.castShadow = true;
    leverGroup.add(collar);

    const leverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.15, 0.21),
      new THREE.Vector3(-0.08, 1.15, 0.54),
      new THREE.Vector3(-0.24, 1.15, 0.58),
      new THREE.Vector3(-1.05, 1.15, 0.54),
    ]);
    const leverMesh = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(leverCurve, 44, 0.072, 18, false)),
      brushedInoxMat,
    );
    leverMesh.scale.set(1, 0.78, 1);
    leverMesh.position.y = 0.25;
    leverMesh.castShadow = true;

    const leverTip = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.072, 18, 14)),
      brushedInoxMat,
    );
    leverTip.scale.set(1, 0.78, 1);
    leverTip.position.set(-1.05, 1.15, 0.54);
    leverGroup.add(leverMesh, leverTip);
    registerPart('lever', leverGroup);
  } else if (archetype === 'breaker') {
    // ----------------------------------------------------------------------
    // SOPRANO — Disjuntor Bipolar DIN C32 3kA INMETRO (11 distinct parts)
    // ----------------------------------------------------------------------
    const polyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xeaf0f4,
        roughness: 0.54,
        metalness: 0.04,
      }),
    );
    const sopranoBlueMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x16649c,
        roughness: 0.28,
        metalness: 0.06,
        clearcoat: 0.35,
      }),
    );
    const darkHousingMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1d2e3a,
        roughness: 0.78,
        metalness: 0.05,
      }),
    );
    const brassScrewMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd4a94f,
        roughness: 0.24,
        metalness: 0.92,
      }),
    );
    const labelFaceMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.breakerLabelColor,
        roughness: 0.44,
        metalness: 0.02,
      }),
    );

    // Stationary Dual-Pole Polycarbonate Chassis
    const chassisGroup = new THREE.Group();
    const mainBodyShape = createRoundedRectShape(1.18, 1.66, 0.08);
    const mainBodyGeo = trackGeo(
      new THREE.ExtrudeGeometry(mainBodyShape, {
        depth: 0.78,
        bevelEnabled: true,
        bevelThickness: 0.024,
        bevelSize: 0.022,
        bevelSegments: 2,
      }),
    );
    mainBodyGeo.center();
    const mainBody = new THREE.Mesh(mainBodyGeo, polyMat);
    mainBody.position.set(0, 0.86, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    chassisGroup.add(mainBody);

    // Subtle pole seam line only on upper & lower shoulders
    const seamTop = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 0.36, 0.82)),
      darkHousingMat,
    );
    seamTop.position.set(0, 1.5, 0.01);
    const seamBot = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 0.36, 0.82)),
      darkHousingMat,
    );
    seamBot.position.set(0, 0.22, 0.01);
    chassisGroup.add(seamTop, seamBot);
    registerPart('chassis', chassisGroup);

    // Part 1: Explodable Raised Front Nose + Printed Technical Faceplate
    const faceplateGroup = new THREE.Group();
    const nose = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.14, 0.92, 0.24)),
      polyMat,
    );
    nose.position.set(0, 0.86, 0.48);
    nose.castShadow = true;
    faceplateGroup.add(nose);

    // Technical printed faceplate plane (offset >= 0.02 forward so zero Z-fighting)
    const labelPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.06, 0.84)),
      labelFaceMat,
    );
    labelPlane.position.set(0, 0.86, 0.615);
    faceplateGroup.add(labelPlane);
    registerPart('faceplate', faceplateGroup);

    // Part 2: Coupled Dual Soprano-Blue Toggle Levers
    const togglesGroup = new THREE.Group();
    const toggleGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.16, 0.38));
    const leftToggle = new THREE.Mesh(toggleGeo, sopranoBlueMat);
    leftToggle.position.set(-0.28, 0.68, 0.72);
    leftToggle.rotation.x = -0.34;
    leftToggle.castShadow = true;

    const rightToggle = new THREE.Mesh(toggleGeo, sopranoBlueMat);
    rightToggle.position.set(0.28, 0.68, 0.72);
    rightToggle.rotation.x = -0.34;
    rightToggle.castShadow = true;

    const tieBar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 0.82, 18)),
      sopranoBlueMat,
    );
    tieBar.rotation.z = Math.PI / 2;
    tieBar.position.set(0, 0.74, 0.88);
    tieBar.castShadow = true;

    // Green/Red mechanical ON indicator window
    const statusIndicator = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.26, 0.07, 0.04)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x269a5c,
          roughness: 0.3,
          metalness: 0.05,
        }),
      ),
    );
    statusIndicator.position.set(-0.28, 0.84, 0.615);
    togglesGroup.add(leftToggle, rightToggle, tieBar, statusIndicator);
    registerPart('toggles', togglesGroup);

    // Part 3: Top & Bottom Brass Tunnel Terminals + Screws
    const terminalsGroup = new THREE.Group();
    const screwHeadGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 20));
    const clampGeo = trackGeo(new THREE.BoxGeometry(0.34, 0.2, 0.3));
    const xPositions = [-0.29, 0.29];
    const yPositions = [1.56, 0.16];
    for (const x of xPositions) {
      for (const y of yPositions) {
        const clamp = new THREE.Mesh(clampGeo, darkHousingMat);
        clamp.position.set(x, y, 0.14);
        const screw = new THREE.Mesh(screwHeadGeo, brassScrewMat);
        screw.position.set(x, y > 1 ? y + 0.11 : y - 0.11, 0.18);
        screw.castShadow = true;
        terminalsGroup.add(clamp, screw);
      }
    }
    registerPart('terminals', terminalsGroup);

    // Part 4: Rear DIN 35mm Rail Mounting Latch
    const clipGroup = new THREE.Group();
    const dinBack = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.06, 0.56, 0.16)),
      darkHousingMat,
    );
    dinBack.position.set(0, 0.86, -0.45);
    const dinTab = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.34, 0.24, 0.1)),
      sopranoBlueMat,
    );
    dinTab.position.set(0, 0.08, -0.42);
    clipGroup.add(dinBack, dinTab);
    registerPart('clip', clipGroup);
  } else {
    // ----------------------------------------------------------------------
    // CARBOGRAFITE — Máscara de Solda Auto-Escurecimento (10 distinct parts)
    // ----------------------------------------------------------------------
    const shellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x182128,
        bumpMap: textures.carbonWeaveBump,
        bumpScale: 0.016,
        roughness: 0.56,
        metalness: 0.18,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4,
      }),
    );
    const greenAccentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x269258,
        roughness: 0.36,
        metalness: 0.14,
      }),
    );
    const mattePolymerMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0d141a,
        roughness: 0.82,
        metalness: 0.05,
      }),
    );
    const opticalGlassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x0b3a2e,
        roughness: 0.08,
        metalness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        transmission: isSoftwareGl ? 0 : 0.45,
        transparent: true,
        opacity: isSoftwareGl ? 0.86 : 0.96,
        ior: 1.54,
      }),
    );
    const solarCellMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x6b3e1b,
        roughness: 0.22,
        metalness: 0.82,
      }),
    );

    // Part 1: Sculpted Curved Composite Shell
    const shellGroup = new THREE.Group();
    // Main curved front shield (partial cylinder sculpted with tapered chin & crown)
    const frontShield = new THREE.Mesh(
      trackGeo(
        new THREE.CylinderGeometry(
          0.74,
          0.62,
          1.46,
          32,
          1,
          true,
          -Math.PI * 0.46,
          Math.PI * 0.92,
        ),
      ),
      shellMat,
    );
    frontShield.material.side = THREE.DoubleSide;
    frontShield.position.set(0, 0.92, 0.02);
    frontShield.castShadow = true;
    frontShield.receiveShadow = true;
    shellGroup.add(frontShield);

    // Rounded crown dome
    const crown = new THREE.Mesh(
      trackGeo(
        new THREE.SphereGeometry(
          0.74,
          28,
          16,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.48,
        ),
      ),
      shellMat,
    );
    crown.position.set(0, 1.62, 0.02);
    crown.scale.set(1, 0.48, 0.98);
    crown.castShadow = true;
    shellGroup.add(crown);

    // Carbografite signature green side ribs + sensitivity dial
    const dial = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.14, 0.15, 0.1, 24)),
      greenAccentMat,
    );
    dial.rotation.z = Math.PI / 2;
    dial.position.set(0.75, 1.02, 0.02);
    dial.castShadow = true;

    const dialCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.13, 16)),
      mattePolymerMat,
    );
    dialCap.rotation.z = Math.PI / 2;
    dialCap.position.set(0.76, 1.02, 0.02);

    const chinTrim = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.63, 0.036, 12, 32, Math.PI * 0.88)),
      greenAccentMat,
    );
    chinTrim.rotation.x = Math.PI / 2;
    chinTrim.rotation.z = Math.PI * 0.06;
    chinTrim.position.set(0, 0.2, 0.02);
    shellGroup.add(dial, dialCap, chinTrim);
    registerPart('shell', shellGroup);

    // Part 2: Beveled Visor Protective Frame Bezel
    const bezelGroup = new THREE.Group();
    const bezelShape = createRoundedRectShape(0.96, 0.56, 0.09);
    const hole = new THREE.Path();
    hole.moveTo(-0.37, -0.17);
    hole.lineTo(0.37, -0.17);
    hole.lineTo(0.37, 0.17);
    hole.lineTo(-0.37, 0.17);
    hole.closePath();
    bezelShape.holes.push(hole);

    const bezelGeo = trackGeo(
      new THREE.ExtrudeGeometry(bezelShape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
      }),
    );
    bezelGeo.center();
    const bezel = new THREE.Mesh(bezelGeo, mattePolymerMat);
    bezel.position.set(0, 1.12, 0.72);
    bezel.castShadow = true;
    bezelGroup.add(bezel);
    registerPart('bezel', bezelGroup);

    // Part 3: Auto-Darkening Optical Filter Cartridge + Solar Strip
    const filterGroup = new THREE.Group();
    const lens = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.74, 0.34, 0.04)),
      opticalGlassMat,
    );
    lens.position.set(0, 1.12, 0.74);
    lens.renderOrder = 2;

    const solarStrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.62, 0.075, 0.048)),
      solarCellMat,
    );
    solarStrip.position.set(0, 1.32, 0.74);
    filterGroup.add(lens, solarStrip);
    registerPart('filter', filterGroup);

    // Part 4: Internal Adjustable Ratchet Headgear Arc
    const headgearGroup = new THREE.Group();
    const bandArc = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.58, 0.048, 12, 32)),
      mattePolymerMat,
    );
    bandArc.rotation.x = Math.PI / 2;
    bandArc.position.set(0, 1.12, -0.14);

    const crownStrap = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.56, 0.038, 10, 24, Math.PI)),
      mattePolymerMat,
    );
    crownStrap.position.set(0, 1.12, -0.14);

    const ratchetKnob = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 20)),
      greenAccentMat,
    );
    ratchetKnob.rotation.x = Math.PI / 2;
    ratchetKnob.position.set(0, 1.12, -0.74);
    headgearGroup.add(bandArc, crownStrap, ratchetKnob);
    registerPart('headgear', headgearGroup);
  }

  // Ground the model accurately at y = 0.04 (flush above the studio pedestal)
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (Number.isFinite(box.min.y)) {
    const liftY = 0.06 - box.min.y;
    for (const part of parts) {
      part.object.position.y += liftY;
      part.basePosition.y += liftY;
    }
  }

  return { root, parts, geometries, materials };
}
