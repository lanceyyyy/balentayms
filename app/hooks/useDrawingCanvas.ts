'use client';

import { useRef, useState, useCallback } from 'react';
import type { StrokePoint, Point } from '../types';

export function useDrawingCanvas() {
  const [strokes, setStrokes] = useState<StrokePoint[][]>([]);
  const currentStrokeRef = useRef<StrokePoint[]>([]);
  const isDrawingRef = useRef(false);

  const addPoint = useCallback((point: StrokePoint) => {
    currentStrokeRef.current.push(point);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    currentStrokeRef.current = [];

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const point: StrokePoint = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
      pressure: e.pointerType === 'pen' ? e.pressure : 0.5,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
      timestamp: e.timeStamp,
      pointerType: e.pointerType,
    };
    addPoint(point);
  }, [addPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Use coalesced events for Apple Pencil 240Hz capture
    const events = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [e.nativeEvent];

    for (const ce of events) {
      const point: StrokePoint = {
        x: (ce.clientX - rect.left) * dpr,
        y: (ce.clientY - rect.top) * dpr,
        pressure: ce.pointerType === 'pen' ? ce.pressure : 0.5,
        tiltX: ce.tiltX || 0,
        tiltY: ce.tiltY || 0,
        timestamp: ce.timeStamp,
        pointerType: ce.pointerType,
      };
      addPoint(point);
    }
  }, [addPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStrokeRef.current.length > 1) {
      setStrokes(prev => [...prev, [...currentStrokeRef.current]]);
    }
    currentStrokeRef.current = [];
  }, []);

  const getAllPoints = useCallback((): Point[] => {
    const allPoints: Point[] = [];
    for (const stroke of strokes) {
      for (const p of stroke) {
        allPoints.push({ x: p.x, y: p.y });
      }
    }
    // Include current in-progress stroke
    for (const p of currentStrokeRef.current) {
      allPoints.push({ x: p.x, y: p.y });
    }
    return allPoints;
  }, [strokes]);

  const getCurrentStroke = useCallback((): StrokePoint[] => {
    return currentStrokeRef.current;
  }, []);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
    currentStrokeRef.current = [];
  }, []);

  return {
    strokes,
    isDrawing: isDrawingRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getAllPoints,
    getCurrentStroke,
    clearStrokes,
  };
}
