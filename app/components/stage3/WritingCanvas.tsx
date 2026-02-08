'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useDrawingCanvas } from '../../hooks/useDrawingCanvas';
import { renderAllStrokes, renderStroke } from '../../lib/strokeRenderer';

export interface WritingCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  hasStrokes: () => boolean;
}

interface WritingCanvasProps {
  frozen: boolean;
  onStrokeEnd: () => void;
  glowIntensity?: number;
}

const WritingCanvas = forwardRef<WritingCanvasHandle, WritingCanvasProps>(
  function WritingCanvas({ frozen, onStrokeEnd, glowIntensity = 0 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const {
      strokes,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      getCurrentStroke,
    } = useDrawingCanvas();

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      hasStrokes: () => strokes.length > 0,
    }));

    // Set canvas size
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const container = canvas.parentElement;
        if (!container) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    // Animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        renderAllStrokes(ctx, strokes, canvas.width, canvas.height);

        // Extra glow when glowIntensity > 0
        if (glowIntensity > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.filter = `blur(${glowIntensity}px)`;
          for (const stroke of strokes) {
            if (stroke.length > 1) renderStroke(ctx, stroke);
          }
          ctx.restore();
        }

        const current = getCurrentStroke();
        if (current.length > 1) {
          renderStroke(ctx, current);
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      animFrameRef.current = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(animFrameRef.current);
    }, [strokes, getCurrentStroke, glowIntensity]);

    const wrappedPointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (frozen) return;
        handlePointerDown(e);
      },
      [frozen, handlePointerDown]
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
        onStrokeEnd();
      },
      [frozen, handlePointerUp, onStrokeEnd]
    );

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
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
);

export default WritingCanvas;
