import getStroke from 'perfect-freehand';
import type { StrokePoint } from '../types';

const STROKE_OPTIONS = {
  size: 10,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: false,
  start: { taper: true, cap: true },
  end: { taper: true, cap: true },
};

const STROKE_OPTIONS_MOUSE = {
  ...STROKE_OPTIONS,
  simulatePressure: true,
};

/**
 * Convert stroke outline points to an SVG path string.
 */
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d: string[] = [];
  const [first, ...rest] = stroke;

  d.push(`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`);

  for (let i = 0; i < rest.length; i++) {
    const [x, y] = rest[i];
    if (i < rest.length - 1) {
      const [nx, ny] = rest[i + 1];
      const mx = ((x + nx) / 2).toFixed(2);
      const my = ((y + ny) / 2).toFixed(2);
      d.push(`Q ${x.toFixed(2)} ${y.toFixed(2)} ${mx} ${my}`);
    } else {
      d.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }

  d.push('Z');
  return d.join(' ');
}

/**
 * Render a single stroke to a canvas context.
 */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[]
): void {
  if (points.length < 2) return;

  const isPen = points[0].pointerType === 'pen';
  const options = isPen ? STROKE_OPTIONS : STROKE_OPTIONS_MOUSE;

  const inputPoints = points.map(p => [p.x, p.y, p.pressure]);
  const outlinePoints = getStroke(inputPoints, options);

  if (outlinePoints.length === 0) return;

  const pathStr = getSvgPathFromStroke(outlinePoints);
  const path2d = new Path2D(pathStr);

  // Create gradient-like effect with glow
  ctx.save();
  ctx.fillStyle = 'rgba(220, 40, 80, 0.92)';
  ctx.shadowColor = 'rgba(255, 50, 100, 0.5)';
  ctx.shadowBlur = 14;
  ctx.fill(path2d);

  // Second pass for inner glow
  ctx.shadowColor = 'rgba(255, 150, 180, 0.3)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(240, 80, 120, 0.4)';
  ctx.fill(path2d);
  ctx.restore();
}

/**
 * Render all strokes to a canvas, clearing first.
 */
export function renderAllStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: StrokePoint[][],
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    renderStroke(ctx, stroke);
  }
}
