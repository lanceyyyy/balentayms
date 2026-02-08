'use client';

import { useMemo } from 'react';
import { generateHeartPoints, getCentroid, angleFromCenter } from '../../lib/heartMath';

interface HeartGuideProps {
  coveredSectors: boolean[];
  canvasWidth: number;
  canvasHeight: number;
}

const NUM_SECTORS = 12;

export default function HeartGuide({ coveredSectors, canvasWidth, canvasHeight }: HeartGuideProps) {
  const segments = useMemo(() => {
    if (canvasWidth === 0 || canvasHeight === 0) return [];

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const smaller = Math.min(canvasWidth, canvasHeight);
    const scale = (smaller * 0.35) / 32;

    const points = generateHeartPoints(200, centerX, centerY, scale);
    const centroid = getCentroid(points);

    // Group points by sector
    const sectorPoints = points.map(p => ({
      x: p.x,
      y: p.y,
      sector: Math.floor((angleFromCenter(centroid, p) / (2 * Math.PI)) * NUM_SECTORS) % NUM_SECTORS,
    }));

    // Build path segments per sector
    const segs: { path: string; sector: number }[] = [];
    let currentSector = sectorPoints[0]?.sector ?? 0;
    let currentPath = `M ${sectorPoints[0]?.x} ${sectorPoints[0]?.y}`;

    for (let i = 1; i < sectorPoints.length; i++) {
      const p = sectorPoints[i];
      if (p.sector !== currentSector) {
        segs.push({ path: currentPath, sector: currentSector });
        currentSector = p.sector;
        currentPath = `M ${sectorPoints[i - 1].x} ${sectorPoints[i - 1].y} L ${p.x} ${p.y}`;
      } else {
        currentPath += ` L ${p.x} ${p.y}`;
      }
    }
    if (sectorPoints.length > 0) {
      currentPath += ` L ${sectorPoints[0].x} ${sectorPoints[0].y}`;
      segs.push({ path: currentPath, sector: currentSector });
    }

    return segs;
  }, [canvasWidth, canvasHeight]);

  if (canvasWidth === 0 || canvasHeight === 0) return null;

  return (
    <svg
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      preserveAspectRatio="none"
    >
      {segments.map((seg, i) => (
        <path
          key={i}
          d={seg.path}
          fill="none"
          stroke={
            coveredSectors[seg.sector]
              ? 'rgba(255, 105, 180, 0.6)'
              : 'rgba(255, 182, 193, 0.15)'
          }
          strokeWidth={coveredSectors[seg.sector] ? 4 : 2.5}
          strokeDasharray={coveredSectors[seg.sector] ? 'none' : '10 8'}
          strokeLinecap="round"
          style={{
            transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
            filter: coveredSectors[seg.sector]
              ? 'drop-shadow(0 0 6px rgba(255, 105, 180, 0.4))'
              : 'none',
          }}
        />
      ))}
    </svg>
  );
}
