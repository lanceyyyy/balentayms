'use client';

import { useCallback, useRef, useState } from 'react';
import { analyzeSectors } from '../lib/shapeMatching';
import type { Point, HeartDetectionResult } from '../types';

export function useHeartDetection(canvasWidth: number, canvasHeight: number) {
  const [result, setResult] = useState<HeartDetectionResult>({
    completionPercentage: 0,
    coveredSectors: new Array(12).fill(false),
    isComplete: false,
    isValidShape: false,
    feedback: 'idle',
  });

  const hasCompletedRef = useRef(false);

  const analyzePoints = useCallback(
    (points: Point[]) => {
      if (hasCompletedRef.current) return;
      if (canvasWidth === 0 || canvasHeight === 0) return;

      const analysis = analyzeSectors(points, canvasWidth, canvasHeight);

      let feedback: HeartDetectionResult['feedback'] = 'idle';
      if (analysis.coveragePercentage > 0 && analysis.coveragePercentage < 50) {
        feedback = 'keep-going';
      } else if (analysis.coveragePercentage >= 50 && !analysis.isComplete) {
        feedback = 'almost';
      } else if (analysis.isComplete) {
        feedback = 'complete';
        hasCompletedRef.current = true;
      }

      setResult({
        completionPercentage: analysis.coveragePercentage,
        coveredSectors: analysis.coveredSectors,
        isComplete: analysis.isComplete,
        isValidShape: analysis.isValidShape,
        feedback,
      });
    },
    [canvasWidth, canvasHeight]
  );

  return { result, analyzePoints };
}
