'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeartCanvas from './HeartCanvas';
import HeartGuide from './HeartGuide';
import InstructionText from './InstructionText';
import CelebrationOverlay from './CelebrationOverlay';
import { useHeartDetection } from '../../hooks/useHeartDetection';
import type { Point, DrawingState } from '../../types';

// Dynamic import for 3D background to avoid SSR issues with Three.js
const Background3D = dynamic(() => import('./Background3D'), { ssr: false });

interface DrawHeartStageProps {
  onComplete: () => void;
}

export default function DrawHeartStage({ onComplete }: DrawHeartStageProps) {
  const [drawingState, setDrawingState] = useState<DrawingState>('idle');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      setDimensions({
        width: window.innerWidth * dpr,
        height: window.innerHeight * dpr,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { result, analyzePoints } = useHeartDetection(
    dimensions.width,
    dimensions.height
  );

  const handlePointsUpdate = useCallback(
    (points: Point[]) => {
      if (drawingState === 'complete') return;
      analyzePoints(points);
    },
    [analyzePoints, drawingState]
  );

  const handleDrawingStateChange = useCallback(
    (isDrawing: boolean) => {
      if (drawingState === 'complete') return;
      setDrawingState(isDrawing ? 'drawing' : (result.completionPercentage > 0 ? 'drawing' : 'idle'));
    },
    [drawingState, result.completionPercentage]
  );

  // Watch for completion
  useEffect(() => {
    if (result.isComplete && drawingState !== 'complete') {
      setDrawingState('complete');
    }
  }, [result.isComplete, drawingState]);

  const handleCelebrationFinished = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="relative h-full w-full" style={{ background: '#0d0208' }}>
      {/* Layer 0: 3D Background */}
      <Background3D />

      {/* Layer 1: Heart Guide SVG - uses DPR-scaled viewBox, fills viewport via CSS */}
      {dimensions.width > 0 && (
        <HeartGuide
          coveredSectors={result.coveredSectors}
          canvasWidth={dimensions.width}
          canvasHeight={dimensions.height}
        />
      )}

      {/* Layer 2: Drawing Canvas */}
      <HeartCanvas
        onPointsUpdate={handlePointsUpdate}
        onDrawingStateChange={handleDrawingStateChange}
        frozen={drawingState === 'complete'}
      />

      {/* Layer 3: Instruction Text */}
      <InstructionText
        drawingState={drawingState}
        completionPercentage={result.completionPercentage}
      />

      {/* Layer 4: Celebration Overlay */}
      {drawingState === 'complete' && (
        <CelebrationOverlay onFinished={handleCelebrationFinished} />
      )}
    </div>
  );
}
