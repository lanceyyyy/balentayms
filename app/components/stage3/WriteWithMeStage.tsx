'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import WritingCanvas, { WritingCanvasHandle } from './WritingCanvas';

const ParticleDissolve = dynamic(() => import('./ParticleDissolve'), { ssr: false });

interface WriteWithMeStageProps {
  onComplete: () => void;
}

type Phase = 'prompt' | 'writing' | 'glowing' | 'dissolving';

function sampleCanvasPixels(canvas: HTMLCanvasElement): { x: number; y: number }[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const result: { x: number; y: number }[] = [];
  const dpr = window.devicePixelRatio || 1;

  const parent = canvas.parentElement;
  const rect = parent?.getBoundingClientRect();
  const offsetX = rect?.left ?? 0;
  const offsetY = rect?.top ?? 0;

  const step = Math.max(4, Math.floor(Math.sqrt((w * h) / 2000)));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 50) {
        result.push({
          x: x / dpr + offsetX,
          y: y / dpr + offsetY,
        });
      }
    }
  }

  return result.slice(0, 2000);
}

export default function WriteWithMeStage({ onComplete }: WriteWithMeStageProps) {
  const [phase, setPhase] = useState<Phase>('prompt');
  const [showDoneButton, setShowDoneButton] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [dissolvePixels, setDissolvePixels] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-transition from prompt to writing
  useEffect(() => {
    const timer = setTimeout(() => setPhase('writing'), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleStrokeEnd = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (canvasRef.current?.hasStrokes()) {
        setShowDoneButton(true);
      }
    }, 1500);
  }, []);

  const handleDone = useCallback(() => {
    setShowDoneButton(false);
    setPhase('glowing');

    let intensity = 0;
    const interval = setInterval(() => {
      intensity += 0.5;
      setGlowIntensity(intensity);
      if (intensity >= 8) {
        clearInterval(interval);
        // Capture pixels BEFORE we unmount the canvas
        const canvas = canvasRef.current?.getCanvas();
        let pixels: { x: number; y: number }[] = [];
        if (canvas) {
          pixels = sampleCanvasPixels(canvas);
        }
        // Fallback: if no pixels captured, generate centered particles
        if (pixels.length === 0) {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          for (let i = 0; i < 200; i++) {
            pixels.push({
              x: cx + (Math.random() - 0.5) * 300,
              y: cy + (Math.random() - 0.5) * 100,
            });
          }
        }
        setDissolvePixels(pixels);
        setTimeout(() => setPhase('dissolving'), 300);
      }
    }, 50);
  }, []);

  const handleDissolveComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="relative h-full w-full" style={{ background: '#0d0208' }}>
      {/* Ambient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #1a0610 0%, #0d0208 70%)',
        }}
      />

      {/* Prompt text */}
      <AnimatePresence>
        {(phase === 'prompt' || phase === 'writing') && (
          <motion.div
            className="absolute top-16 md:top-24 left-0 right-0 z-20 text-center px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-2xl md:text-4xl"
              style={{
                fontFamily: 'var(--font-script)',
                color: '#fce4ec',
                textShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
              }}
            >
              Write one word that describes us
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Writing canvas area */}
      {(phase === 'writing' || phase === 'glowing') && (
        <motion.div
          className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 z-10"
          style={{ height: '200px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'glowing' && glowIntensity >= 8 ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute bottom-4 left-8 right-8 h-px"
            style={{ background: 'rgba(255, 182, 193, 0.2)' }}
          />
          <WritingCanvas
            ref={canvasRef}
            frozen={phase === 'glowing'}
            onStrokeEnd={handleStrokeEnd}
            glowIntensity={glowIntensity}
          />
        </motion.div>
      )}

      {/* Done button */}
      <AnimatePresence>
        {showDoneButton && phase === 'writing' && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 z-20 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full text-base cursor-pointer"
              style={{
                fontFamily: 'var(--font-romantic)',
                background: 'linear-gradient(135deg, #e91e63, #ff69b4)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle dissolve - pixels are pre-captured before canvas unmounts */}
      {phase === 'dissolving' && (
        <ParticleDissolve
          pixels={dissolvePixels}
          onComplete={handleDissolveComplete}
        />
      )}
    </div>
  );
}
