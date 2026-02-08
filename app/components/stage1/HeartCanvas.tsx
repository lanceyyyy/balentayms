'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useDrawingCanvas } from '../../hooks/useDrawingCanvas';
import { renderAllStrokes, renderStroke } from '../../lib/strokeRenderer';
import type { Point } from '../../types';

interface HeartCanvasProps {
  onPointsUpdate: (points: Point[]) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  frozen: boolean;
}

export default function HeartCanvas({
  onPointsUpdate,
  onDrawingStateChange,
  frozen,
}: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const {
    strokes,
    isDrawing,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getAllPoints,
    getCurrentStroke,
  } = useDrawingCanvas();

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Redraw all strokes after resize
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderAllStrokes(ctx, strokes, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [strokes]);

  // Animation loop for live stroke rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      renderAllStrokes(ctx, strokes, canvas.width, canvas.height);

      // Also render the in-progress stroke
      const current = getCurrentStroke();
      if (current.length > 1) {
        renderStroke(ctx, current);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [strokes, getCurrentStroke]);

  // Notify parent of points updates
  useEffect(() => {
    onPointsUpdate(getAllPoints());
  }, [strokes, getAllPoints, onPointsUpdate]);

  const wrappedPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (frozen) return;
      handlePointerDown(e);
      onDrawingStateChange(true);
    },
    [frozen, handlePointerDown, onDrawingStateChange]
  );

  const wrappedPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (frozen) return;
      handlePointerMove(e);
    },
    [frozen, handlePointerMove]
  );

  const wrappedPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (frozen) return;
      handlePointerUp(e);
      onDrawingStateChange(false);
      // Trigger detection after stroke completes
      setTimeout(() => onPointsUpdate(getAllPoints()), 0);
    },
    [frozen, handlePointerUp, onDrawingStateChange, onPointsUpdate, getAllPoints]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 cursor-crosshair"
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onPointerDown={wrappedPointerDown}
      onPointerMove={wrappedPointerMove}
      onPointerUp={wrappedPointerUp}
      onPointerLeave={wrappedPointerUp}
      onPointerCancel={wrappedPointerUp}
    />
  );
}
