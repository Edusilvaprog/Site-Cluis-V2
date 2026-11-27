import * as THREE from 'three';

export interface ProceduralTexturePack {
  textures: THREE.Texture[];
  microfiberColor: THREE.CanvasTexture;
  microfiberBump: THREE.CanvasTexture;
  brushedSteelBump: THREE.CanvasTexture;
  breakerLabelColor: THREE.CanvasTexture;
  carbonWeaveBump: THREE.CanvasTexture;
  contactShadowAlpha: THREE.CanvasTexture;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D context for procedural texture');
  }
  return [canvas, ctx];
}

export function createProceduralTexturePack(
  maxAnisotropy: number,
): ProceduralTexturePack {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));
  const textures: THREE.Texture[] = [];

  // 1. Roma Microfiber Roller Sleeve (Color + Bump)
  const [mfColorCanvas, mfColorCtx] = makeCanvas(256, 256);
  mfColorCtx.fillStyle = '#F4F6F8';
  mfColorCtx.fillRect(0, 0, 256, 256);
  // Subtle diagonal woven stripes characteristic of anti-drip microfiber sleeves
  mfColorCtx.strokeStyle = '#1E5B88';
  mfColorCtx.lineWidth = 7;
  for (let i = -256; i < 512; i += 44) {
    mfColorCtx.beginPath();
    mfColorCtx.moveTo(i, 0);
    mfColorCtx.lineTo(i + 256, 256);
    mfColorCtx.stroke();
  }
  // Soft plush grain noise
  for (let y = 0; y < 256; y += 3) {
    for (let x = 0; x < 256; x += 3) {
      const v = 225 + ((x * 37 + y * 17) % 30);
      mfColorCtx.fillStyle = `rgba(${v},${v},${v},0.35)`;
      mfColorCtx.fillRect(x, y, 2, 2);
    }
  }
  const microfiberColor = new THREE.CanvasTexture(mfColorCanvas);
  microfiberColor.colorSpace = THREE.SRGBColorSpace;
  microfiberColor.wrapS = THREE.RepeatWrapping;
  microfiberColor.wrapT = THREE.RepeatWrapping;
  microfiberColor.repeat.set(2, 1);
  microfiberColor.anisotropy = anisotropy;
  textures.push(microfiberColor);

  const [mfBumpCanvas, mfBumpCtx] = makeCanvas(256, 256);
  mfBumpCtx.fillStyle = '#808080';
  mfBumpCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      const n = ((Math.sin(x * 0.43 + y * 0.21) * 43758.5453) % 1 + 1) % 1;
      const shade = Math.floor(85 + n * 150);
      mfBumpCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
      mfBumpCtx.fillRect(x, y, 2, 2);
    }
  }
  const microfiberBump = new THREE.CanvasTexture(mfBumpCanvas);
  microfiberBump.wrapS = THREE.RepeatWrapping;
  microfiberBump.wrapT = THREE.RepeatWrapping;
  microfiberBump.repeat.set(3, 2);
  microfiberBump.anisotropy = anisotropy;
  textures.push(microfiberBump);

  // 2. Soprano Brushed Stainless Steel 304 Bump/Roughness Map
  const [steelCanvas, steelCtx] = makeCanvas(256, 256);
  steelCtx.fillStyle = '#808080';
  steelCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    const streak = 110 + ((y * 53 + (y % 7) * 19) % 45);
    steelCtx.fillStyle = `rgb(${streak},${streak},${streak})`;
    steelCtx.fillRect(0, y, 256, 1);
  }
  const brushedSteelBump = new THREE.CanvasTexture(steelCanvas);
  brushedSteelBump.wrapS = THREE.RepeatWrapping;
  brushedSteelBump.wrapT = THREE.RepeatWrapping;
  brushedSteelBump.repeat.set(1, 2);
  brushedSteelBump.anisotropy = anisotropy;
  textures.push(brushedSteelBump);

  // 3. Soprano DIN Circuit Breaker Faceplate Technical Label (sRGB)
  const [brkCanvas, brkCtx] = makeCanvas(512, 512);
  brkCtx.fillStyle = '#F2F5F8';
  brkCtx.fillRect(0, 0, 512, 512);

  // Top brand header band
  brkCtx.fillStyle = '#124E78';
  brkCtx.fillRect(36, 36, 440, 56);
  brkCtx.fillStyle = '#FFFFFF';
  brkCtx.font = '700 30px sans-serif';
  brkCtx.textAlign = 'left';
  brkCtx.fillText('SOPRANO', 58, 74);
  brkCtx.font = '600 18px monospace';
  brkCtx.textAlign = 'right';
  brkCtx.fillText('SHB-GII', 454, 72);

  // Rating callout
  brkCtx.fillStyle = '#0D2534';
  brkCtx.font = '700 56px monospace';
  brkCtx.textAlign = 'left';
  brkCtx.fillText('C32', 42, 168);

  brkCtx.fillStyle = '#334E5E';
  brkCtx.font = '600 22px monospace';
  brkCtx.fillText('230/400V~  50/60Hz', 42, 206);

  // Breaking capacity box [3000]
  brkCtx.strokeStyle = '#0D2534';
  brkCtx.lineWidth = 4;
  brkCtx.strokeRect(42, 228, 128, 44);
  brkCtx.fillStyle = '#0D2534';
  brkCtx.font = '700 26px monospace';
  brkCtx.textAlign = 'center';
  brkCtx.fillText('3000', 106, 259);

  // Schematic circuit symbol right side
  brkCtx.strokeStyle = '#1C2E3A';
  brkCtx.lineWidth = 3.5;
  brkCtx.beginPath();
  brkCtx.moveTo(356, 134);
  brkCtx.lineTo(356, 178);
  brkCtx.lineTo(334, 224);
  brkCtx.moveTo(356, 224);
  brkCtx.lineTo(356, 266);
  brkCtx.moveTo(416, 134);
  brkCtx.lineTo(416, 178);
  brkCtx.lineTo(394, 224);
  brkCtx.moveTo(416, 224);
  brkCtx.lineTo(416, 266);
  brkCtx.stroke();

  // Bottom certification mark
  brkCtx.fillStyle = '#E3ECF2';
  brkCtx.fillRect(36, 404, 440, 68);
  brkCtx.fillStyle = '#16394E';
  brkCtx.font = '700 20px sans-serif';
  brkCtx.textAlign = 'left';
  brkCtx.fillText('NBR NM 60898 · INMETRO', 56, 446);

  const breakerLabelColor = new THREE.CanvasTexture(brkCanvas);
  breakerLabelColor.colorSpace = THREE.SRGBColorSpace;
  breakerLabelColor.anisotropy = anisotropy;
  textures.push(breakerLabelColor);

  // 4. Carbografite Matte Polyamide / Carbon Micro-Weave Bump Map
  const [carbCanvas, carbCtx] = makeCanvas(256, 256);
  carbCtx.fillStyle = '#6E6E6E';
  carbCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      const parity = ((x + y) / 8) % 2 === 0;
      carbCtx.fillStyle = parity ? '#9C9C9C' : '#555555';
      carbCtx.fillRect(x, y, 7, 3);
      carbCtx.fillStyle = parity ? '#5E5E5E' : '#909090';
      carbCtx.fillRect(x, y + 4, 7, 3);
    }
  }
  const carbonWeaveBump = new THREE.CanvasTexture(carbCanvas);
  carbonWeaveBump.wrapS = THREE.RepeatWrapping;
  carbonWeaveBump.wrapT = THREE.RepeatWrapping;
  carbonWeaveBump.repeat.set(6, 6);
  carbonWeaveBump.anisotropy = anisotropy;
  textures.push(carbonWeaveBump);

  // 5. Soft Radial Studio Contact Shadow
  const [shadowCanvas, shadowCtx] = makeCanvas(256, 256);
  const grad = shadowCtx.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(7, 23, 34, 0.56)');
  grad.addColorStop(0.45, 'rgba(7, 23, 34, 0.24)');
  grad.addColorStop(1, 'rgba(7, 23, 34, 0.0)');
  shadowCtx.fillStyle = grad;
  shadowCtx.fillRect(0, 0, 256, 256);
  const contactShadowAlpha = new THREE.CanvasTexture(shadowCanvas);
  textures.push(contactShadowAlpha);

  return {
    textures,
    microfiberColor,
    microfiberBump,
    brushedSteelBump,
    breakerLabelColor,
    carbonWeaveBump,
    contactShadowAlpha,
  };
}
