export interface SvgViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapCalloutLayout {
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  textX: number;
  textY: number;
  stemX: number;
  stemY: number;
  placedAbove: boolean;
}

const PILL_HEIGHT = 25;
const EDGE_MARGIN_X = 12;
const EDGE_MARGIN_Y = 10;
const VERTICAL_GAP = 13;

/**
 * Computes strictly clamped SVG coordinates for a municipality callout pill
 * so long or edge-positioned city names never clip outside the viewBox.
 */
export function computeMapCalloutLayout(
  cityName: string,
  cx: number,
  cy: number,
  viewBox: SvgViewBox,
): MapCalloutLayout {
  const boxWidth = Math.max(92, Math.ceil(cityName.length * 7.6 + 28));
  const boxHeight = PILL_HEIGHT;

  const minX = viewBox.x + EDGE_MARGIN_X;
  const maxX = viewBox.x + viewBox.w - boxWidth - EDGE_MARGIN_X;
  const rawX = cx - boxWidth / 2;
  const boxX = Math.min(Math.max(rawX, minX), maxX);

  const aboveY = cy - VERTICAL_GAP - boxHeight;
  const belowY = cy + VERTICAL_GAP;
  const minY = viewBox.y + EDGE_MARGIN_Y;
  const maxY = viewBox.y + viewBox.h - boxHeight - EDGE_MARGIN_Y;

  const placedAbove = aboveY >= minY;
  const boxY = Math.min(Math.max(placedAbove ? aboveY : belowY, minY), maxY);

  const stemX = Math.min(Math.max(cx, boxX + 14), boxX + boxWidth - 14);
  const stemY = placedAbove ? boxY + boxHeight : boxY;

  return {
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    textX: boxX + boxWidth / 2,
    textY: boxY + boxHeight / 2 + 3.8,
    stemX,
    stemY,
    placedAbove,
  };
}
