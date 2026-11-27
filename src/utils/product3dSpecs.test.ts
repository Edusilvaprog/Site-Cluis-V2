import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_LINES } from '../data/cluisData';
import {
  clampExplodeAmount,
  computeExplodedPosition,
  getProduct3DSpec,
  resolveProduct3DArchetype,
} from './product3dSpecs';

test('resolveProduct3DArchetype maps every Cluis product line to an appropriate 3D hardware model', () => {
  assert.equal(resolveProduct3DArchetype('roma-rolos', 'roma'), 'roller');
  assert.equal(resolveProduct3DArchetype('soprano-fechaduras', 'soprano'), 'lock');
  assert.equal(resolveProduct3DArchetype('soprano-eletricos', 'soprano'), 'breaker');
  assert.equal(resolveProduct3DArchetype('soprano-tomadas', 'soprano'), 'breaker');
  assert.equal(resolveProduct3DArchetype('carbografite-solda', 'carbografite'), 'helmet');

  for (const line of PRODUCT_LINES) {
    const spec = getProduct3DSpec(line);
    assert.ok(spec.title.length > 0);
    assert.ok(spec.parts.length >= 4, `Expected >=4 parts for ${line.id}`);
  }
});

test('clampExplodeAmount clamps out-of-range and non-finite inputs safely', () => {
  assert.equal(clampExplodeAmount(-0.4), 0);
  assert.equal(clampExplodeAmount(0.55), 0.55);
  assert.equal(clampExplodeAmount(2.5), 1);
  assert.equal(clampExplodeAmount(Number.NaN), 0);
});

test('computeExplodedPosition interpolates assembly parts cleanly', () => {
  const base: [number, number, number] = [0, 1, 0];
  const delta: [number, number, number] = [0.2, 0.5, -0.4];

  assert.deepEqual(computeExplodedPosition(base, delta, 0), [0, 1, 0]);
  assert.deepEqual(computeExplodedPosition(base, delta, 0.5), [0.1, 1.25, -0.2]);
  assert.deepEqual(computeExplodedPosition(base, delta, 1), [0.2, 1.5, -0.4]);
});
