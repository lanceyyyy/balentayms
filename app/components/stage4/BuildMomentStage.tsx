'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import StarfieldScene from './StarfieldScene';

interface BuildMomentStageProps {
  onComplete: () => void;
}

type Phase = 'forming' | 'hearts' | 'text' | 'fadeout';

export default function BuildMomentStage({ onComplete }: BuildMomentStageProps) {
  const [phase, setPhase] = useState<Phase>('forming');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('hearts'), 3000),
      setTimeout(() => setPhase('text'), 7000),
      setTimeout(() => setPhase('fadeout'), 12000),
      setTimeout(() => onComplete(), 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative h-full w-full" style={{ background: '#050510' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <StarfieldScene phase={phase} />
        <ambientLight intensity={0.1} color="#ffb6c1" />
        <AdaptiveDpr pixelated />
      </Canvas>

      {/* Overlay text during text phase */}
      <AnimatePresence>
        {phase === 'text' && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 2 }}
          >
            <p
              className="text-2xl md:text-6xl text-center px-8"
              style={{
                fontFamily: 'var(--font-script)',
                color: 'rgba(252, 228, 236, 0.6)',
                textShadow: '0 0 30px rgba(233, 30, 99, 0.3)',
              }}
            >
              There&apos;s just one more thing...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fade to black overlay */}
      {phase === 'fadeout' && (
        <motion.div
          className="absolute inset-0 z-20"
          style={{ background: '#050510' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
      )}
    </div>
  );
}
