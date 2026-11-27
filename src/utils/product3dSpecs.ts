import type { BrandId, ProductLine } from '../data/cluisData';

export type Product3DArchetype = 'roller' | 'lock' | 'breaker' | 'helmet';

export interface Product3DPartSpec {
  id: string;
  label: string;
  materialNote: string;
  explodeDelta: [number, number, number];
}

export interface Product3DSceneSpec {
  archetype: Product3DArchetype;
  title: string;
  subtitle: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  accentHex: string;
  parts: Product3DPartSpec[];
}

export const PRODUCT_3D_SPECS: Record<Product3DArchetype, Product3DSceneSpec> = {
  roller: {
    archetype: 'roller',
    title: 'Rolo Antigota Profissional 23cm',
    subtitle: 'Roma Pincéis · Microfibra de alta densidade e aço galvanizado',
    cameraPosition: [2.8, 1.85, 3.6],
    cameraTarget: [0, 0.88, 0],
    accentHex: '#C62828',
    parts: [
      {
        id: 'sleeve',
        label: 'Manta Microfibra 23cm',
        materialNote: 'Fio tecido antigota para acrílica e látex',
        explodeDelta: [0, 0.72, 0],
      },
      {
        id: 'caps',
        label: 'Buchas de Retenção',
        materialNote: 'Polipropileno industrial azul-marinho',
        explodeDelta: [0, 0.42, 0.35],
      },
      {
        id: 'frame',
        label: 'Garfo Gaiola Galvanizado',
        materialNote: 'Arame de aço tratado anticorrosão',
        explodeDelta: [0, 0.08, 0],
      },
      {
        id: 'handle',
        label: 'Cabo Ergonômico Rosqueável',
        materialNote: 'Grip anatômico com encaixe para extensor',
        explodeDelta: [0, -0.52, 0],
      },
    ],
  },
  lock: {
    archetype: 'lock',
    title: 'Fechadura Residencial Aço Inox 304',
    subtitle: 'Soprano · Acabamento escovado resistente à maresia',
    cameraPosition: [3.4, 1.85, 3.85],
    cameraTarget: [-0.15, 0.96, 0],
    accentHex: '#1B6CA8',
    parts: [
      {
        id: 'lever',
        label: 'Maçaneta Ergonômica Inox',
        materialNote: 'Aço inox 304 escovado de alta durabilidade',
        explodeDelta: [0, 0, 0.72],
      },
      {
        id: 'rosette',
        label: 'Espelho e Roseta Blindada',
        materialNote: 'Fixação oculta contra oxidação no litoral',
        explodeDelta: [0, 0, 0.34],
      },
      {
        id: 'cylinder',
        label: 'Cilindro Multiponto em Latão',
        materialNote: 'Pinos de latão maciço de alta precisão',
        explodeDelta: [0, -0.14, 0.52],
      },
      {
        id: 'mortise',
        label: 'Máquina Interna Reforçada',
        materialNote: 'Caixa blindada com lingueta e trinco reversível',
        explodeDelta: [0, 0, -0.52],
      },
    ],
  },
  breaker: {
    archetype: 'breaker',
    title: 'Disjuntor Bipolar DIN C32 3kA',
    subtitle: 'Soprano · Certificação INMETRO e borne em latão',
    cameraPosition: [3.25, 2.05, 4.15],
    cameraTarget: [0, 0.95, 0],
    accentHex: '#1B6CA8',
    parts: [
      {
        id: 'toggles',
        label: 'Alavanca Bipolar Interligada',
        materialNote: 'Disparo térmico e magnético simultâneo',
        explodeDelta: [0, 0.1, 0.66],
      },
      {
        id: 'faceplate',
        label: 'Painel Frontal Técnico',
        materialNote: 'Policarbonato antichama com gravação C32 · 3kA',
        explodeDelta: [0, 0, 0.36],
      },
      {
        id: 'terminals',
        label: 'Bornes e Parafusos em Latão',
        materialNote: 'Fixação firme para cabos de 1,5mm² a 25mm²',
        explodeDelta: [0, 0.36, 0.12],
      },
      {
        id: 'clip',
        label: 'Trava para Trilho DIN 35mm',
        materialNote: 'Encaixe rápido em quadros de distribuição',
        explodeDelta: [0, 0, -0.56],
      },
    ],
  },
  helmet: {
    archetype: 'helmet',
    title: 'Máscara de Solda Auto-Escurecimento',
    subtitle: 'Carbografite · CA vigente, visor óptico e ajuste lateral',
    cameraPosition: [3.2, 1.85, 3.85],
    cameraTarget: [0, 0.96, 0],
    accentHex: '#2E9A5D',
    parts: [
      {
        id: 'filter',
        label: 'Cartucho Óptico Automático',
        materialNote: 'Escurecimento instantâneo com células solares',
        explodeDelta: [0, 0.05, 0.72],
      },
      {
        id: 'bezel',
        label: 'Moldura de Proteção Frontal',
        materialNote: 'Vedação contra faíscas e respingos',
        explodeDelta: [0, 0.05, 0.42],
      },
      {
        id: 'shell',
        label: 'Casco Compósito de Alto Impacto',
        materialNote: 'Poliamida leve e resistente a altas temperaturas',
        explodeDelta: [0, 0.16, 0],
      },
      {
        id: 'headgear',
        label: 'Carneira com Catraca Regulável',
        materialNote: 'Ajuste anatômico de pressão e inclinação',
        explodeDelta: [0, -0.1, -0.68],
      },
    ],
  },
};

/**
 * Pure mapping from any Cluis product line to its studio 3D hardware archetype.
 */
export function resolveProduct3DArchetype(
  lineId: string,
  brandId: BrandId,
): Product3DArchetype {
  if (brandId === 'roma') return 'roller';
  if (brandId === 'carbografite') return 'helmet';
  // Soprano splits between electrical (breaker) and hardware/locks (lock)
  const normalized = lineId.toLowerCase();
  if (
    normalized.includes('eletric') ||
    normalized.includes('tomad') ||
    normalized.includes('disjuntor')
  ) {
    return 'breaker';
  }
  return 'lock';
}

export function getProduct3DSpec(
  line: Pick<ProductLine, 'id' | 'brandId'>,
): Product3DSceneSpec {
  const archetype = resolveProduct3DArchetype(line.id, line.brandId);
  return PRODUCT_3D_SPECS[archetype];
}

export function clampExplodeAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function computeExplodedPosition(
  base: readonly [number, number, number],
  delta: readonly [number, number, number],
  amount: number,
): [number, number, number] {
  const t = clampExplodeAmount(amount);
  return [
    base[0] + delta[0] * t,
    base[1] + delta[1] * t,
    base[2] + delta[2] * t,
  ];
}
