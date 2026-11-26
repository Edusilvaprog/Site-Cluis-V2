import test from 'node:test';
import assert from 'node:assert/strict';
import { BAIXADA_POLYGONS, VALE_POLYGONS } from '../data/mapPolygons';
import { computeMapCalloutLayout, type SvgViewBox } from './mapLabelLayout';

const MAP_VIEWBOX: SvgViewBox = { x: 36, y: 8, w: 468, h: 316 };
const COMPASS_BOUNDS = { x: 466, y: 260, w: 28, h: 42 };

function intersectsCompass(box: {
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
}) {
  return !(
    box.boxX + box.boxWidth < COMPASS_BOUNDS.x ||
    box.boxX > COMPASS_BOUNDS.x + COMPASS_BOUNDS.w ||
    box.boxY + box.boxHeight < COMPASS_BOUNDS.y ||
    box.boxY > COMPASS_BOUNDS.y + COMPASS_BOUNDS.h
  );
}

test('every Baixada Santista city label stays strictly inside viewBox and clear of compass', () => {
  for (const poly of BAIXADA_POLYGONS) {
    const layout = computeMapCalloutLayout(poly.name, poly.cx, poly.cy, MAP_VIEWBOX);
    assert.ok(
      layout.boxX >= MAP_VIEWBOX.x + 12,
      `${poly.name} left edge clipped: ${layout.boxX}`,
    );
    assert.ok(
      layout.boxX + layout.boxWidth <= MAP_VIEWBOX.x + MAP_VIEWBOX.w - 12,
      `${poly.name} right edge clipped`,
    );
    assert.ok(
      layout.boxY >= MAP_VIEWBOX.y + 10,
      `${poly.name} top edge clipped`,
    );
    assert.ok(
      layout.boxY + layout.boxHeight <= MAP_VIEWBOX.y + MAP_VIEWBOX.h - 10,
      `${poly.name} bottom edge clipped`,
    );
    assert.equal(
      intersectsCompass(layout),
      false,
      `${poly.name} collided with compass`,
    );
  }
});

test('every Vale do Ribeira city label (including São Lourenço da Serra and Itapirapuã Paulista) stays inside viewBox', () => {
  for (const poly of VALE_POLYGONS) {
    const layout = computeMapCalloutLayout(poly.name, poly.cx, poly.cy, MAP_VIEWBOX);
    assert.ok(
      layout.boxX >= MAP_VIEWBOX.x + 12,
      `${poly.name} left edge clipped: ${layout.boxX}`,
    );
    assert.ok(
      layout.boxX + layout.boxWidth <= MAP_VIEWBOX.x + MAP_VIEWBOX.w - 12,
      `${poly.name} right edge clipped`,
    );
    assert.ok(
      layout.boxY >= MAP_VIEWBOX.y + 10,
      `${poly.name} top edge clipped`,
    );
    assert.ok(
      layout.boxY + layout.boxHeight <= MAP_VIEWBOX.y + MAP_VIEWBOX.h - 10,
      `${poly.name} bottom edge clipped`,
    );
    assert.equal(
      intersectsCompass(layout),
      false,
      `${poly.name} collided with compass`,
    );
  }
});
