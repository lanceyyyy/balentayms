'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useDrawingCanvas } from '../../hooks/useDrawingCanvas';
import { renderAllStrokes, renderStroke } from '../../lib/strokeRenderer';

interface SignatureCanvasProps {
  onSigned: () => void;
}

export default function SignatureCanvas({ onSigned }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasSigned, setHasSigned] = useState(false);

  const {
    strokes,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getCurrentStroke,
  } = useDrawingCanvas();

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
      const current = getCurrentStroke();
      if (current.length > 1) {
        renderStroke(ctx, current);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [strokes, getCurrentStroke]);

  // Detect when signing is done (1.5s after last stroke)
  useEffect(() => {
    if (strokes.length > 0 && !hasSigned) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setHasSigned(true);
        onSigned();
      }, 1500);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [strokes, hasSigned, onSigned]);

  const wrappedPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (hasSigned) return;
      handlePointerDown(e);
    },
    [hasSigned, handlePointerDown]
  );

  const wrappedPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (hasSigned) return;
      handlePointerMove(e);
    },
    [hasSigned, handlePointerMove]
  );

  const wrappedPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (hasSigned) return;
      handlePointerUp(e);
    },
    [hasSigned, handlePointerUp]
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
