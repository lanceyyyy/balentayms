import type { Point } from '../types';

/**
 * Generate points along the parametric heart curve.
 * Uses the classic heart equation:
 *   x = 16 * sin^3(t)
 *   y = 13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t)
 */
export function generateHeartPoints(
  numPoints: number,
  centerX: number,
  centerY: number,
  scale: number
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({
      x: centerX + x * scale,
      y: centerY + y * scale,
    });
  }
  return points;
}

/**
 * Generate an SVG path string for the heart curve.
 */
export function generateHeartSVGPath(
  centerX: number,
  centerY: number,
  scale: number
): string {
  const points = generateHeartPoints(200, centerX, centerY, scale);
  if (points.length === 0) return '';

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += ' Z';
  return d;
}

/**
 * Get the bounding box of a set of points.
 */
export function getBoundingBox(points: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Get the centroid of points.
 */
export function getCentroid(points: Point[]): Point {
  let sx = 0, sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

/**
 * Calculate the distance between two points.
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Compute the angle from a center to a point (in radians, 0 to 2*PI).
 */
export function angleFromCenter(center: Point, point: Point): number {
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  return angle < 0 ? angle + 2 * Math.PI : angle;
}

/**
 * Calculate the appropriate heart scale for given dimensions.
 */
export function getHeartScale(width: number, height: number): number {
  const smaller = Math.min(width, height);
  // The parametric heart spans roughly -16 to 16 in x, -17 to 15 in y
  // So total span is about 32 units wide, 32 units tall
  // We want it to fill about 40% of the smaller dimension
  return (smaller * 0.35) / 32;
}
