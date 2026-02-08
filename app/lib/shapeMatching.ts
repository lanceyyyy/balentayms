import type { Point } from '../types';
import { generateHeartPoints, getBoundingBox, getCentroid, distance, angleFromCenter } from './heartMath';

const NUM_SECTORS = 12;
const COVERAGE_THRESHOLD = 0.70; // 70% of sectors must be covered
const PROXIMITY_THRESHOLD_RATIO = 0.18; // point must be within 18% of bounding radius

export interface SectorAnalysis {
  coveredSectors: boolean[];
  coveragePercentage: number;
  isComplete: boolean;
  isValidShape: boolean;
}

/**
 * Analyze how well user-drawn points match the reference heart.
 */
export function analyzeSectors(
  drawnPoints: Point[],
  canvasWidth: number,
  canvasHeight: number
): SectorAnalysis {
  if (drawnPoints.length < 10) {
    return {
      coveredSectors: new Array(NUM_SECTORS).fill(false),
      coveragePercentage: 0,
      isComplete: false,
      isValidShape: false,
    };
  }

  // Generate reference heart centered on canvas
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const smaller = Math.min(canvasWidth, canvasHeight);
  const scale = (smaller * 0.35) / 32;

  const refPoints = generateHeartPoints(200, centerX, centerY, scale);
  const refCentroid = getCentroid(refPoints);
  const refBBox = getBoundingBox(refPoints);
  const boundingRadius = Math.max(refBBox.width, refBBox.height) / 2;
  const proximityThreshold = boundingRadius * PROXIMITY_THRESHOLD_RATIO;

  // Assign each reference point to a sector
  const sectorForRef = refPoints.map(p => {
    const angle = angleFromCenter(refCentroid, p);
    return Math.floor((angle / (2 * Math.PI)) * NUM_SECTORS) % NUM_SECTORS;
  });

  // For each sector, check if any drawn point is close to a reference point in that sector
  const coveredSectors = new Array(NUM_SECTORS).fill(false);

  for (const dp of drawnPoints) {
    for (let i = 0; i < refPoints.length; i++) {
      if (distance(dp, refPoints[i]) <= proximityThreshold) {
        coveredSectors[sectorForRef[i]] = true;
      }
    }
  }

  const coveredCount = coveredSectors.filter(Boolean).length;
  const coveragePercentage = (coveredCount / NUM_SECTORS) * 100;

  // Shape validation
  const isValidShape = validateShape(drawnPoints, refCentroid, boundingRadius);

  const isComplete = coveragePercentage >= COVERAGE_THRESHOLD * 100 && isValidShape;

  return {
    coveredSectors,
    coveragePercentage,
    isComplete,
    isValidShape,
  };
}

/**
 * Validate that the drawn shape roughly looks like a heart (not random scribbles).
 */
function validateShape(
  points: Point[],
  refCentroid: Point,
  boundingRadius: number
): boolean {
  if (points.length < 20) return false;

  const bbox = getBoundingBox(points);

  // Aspect ratio check: should be roughly square-ish (0.5 to 1.8)
  const aspectRatio = bbox.width / bbox.height;
  if (aspectRatio < 0.5 || aspectRatio > 1.8) return false;

  // Size check: drawing should be at least 25% of the reference size
  const drawnSize = Math.max(bbox.width, bbox.height);
  if (drawnSize < boundingRadius * 0.5) return false;

  // Average distance check: points shouldn't be too scattered
  let totalDist = 0;
  for (const p of points) {
    totalDist += distance(p, refCentroid);
  }
  const avgDist = totalDist / points.length;
  if (avgDist > boundingRadius * 2) return false;

  return true;
}
