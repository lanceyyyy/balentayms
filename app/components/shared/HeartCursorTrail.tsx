'use client';

import { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const MAX_POINTS = 20;
const MAX_AGE = 1.0;
const HEART_SIZE = 8;

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff69b4';
  ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3);
  ctx.bezierCurveTo(x + size * 0.5, y - size * 0.8, x + size * 0.9, y - size * 0.1, x, y + size * 0.5);
  ctx.moveTo(x, y - size * 0.3);
  ctx.bezierCurveTo(x - size * 0.5, y - size * 0.8, x - size * 0.9, y - size * 0.1, x, y + size * 0.5);
  ctx.fill();
  ctx.restore();
}

export default function HeartCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastPosRef = useRef({ x: -1, y: -1 });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const handlePointerMove = (e: PointerEvent) => {
      const { clientX, clientY } = e;
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      // Only add point if moved enough
      if (dx * dx + dy * dy > 64) {
        pointsRef.current.push({ x: clientX, y: clientY, age: 0 });
        if (pointsRef.current.length > MAX_POINTS) {
          pointsRef.current.shift();
        }
        lastPosRef.current = { x: clientX, y: clientY };
      }
    };

    window.addEventListener('pointermove', handlePointerMove);

    const animate = (time: number) => {
      const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Age and draw points
      const points = pointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age += delta;
        if (points[i].age >= MAX_AGE) {
          points.splice(i, 1);
          continue;
        }
        const t = 1 - points[i].age / MAX_AGE;
        const size = HEART_SIZE * t;
        const alpha = t * 0.6;
        drawHeart(ctx, points[i].x, points[i].y, size, alpha);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
