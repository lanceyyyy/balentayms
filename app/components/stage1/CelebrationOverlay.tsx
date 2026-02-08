'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';

const HeartCompletionTransition = dynamic(() => import('./HeartCompletionTransition'), { ssr: false });

interface CelebrationOverlayProps {
  onFinished: () => void;
}

function Particle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        width: 4 + Math.random() * 6,
        height: 4 + Math.random() * 6,
        background: ['#ff69b4', '#e91e63', '#ff1493', '#ff80ab', '#f48fb1'][
          Math.floor(Math.random() * 5)
        ],
        boxShadow: '0 0 6px rgba(255, 105, 180, 0.6)',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: x * (80 + Math.random() * 120),
        y: y * (80 + Math.random() * 120),
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: 1.2 + Math.random() * 0.8,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

export default function CelebrationOverlay({ onFinished }: CelebrationOverlayProps) {
  const [phase, setPhase] = useState<'burst' | 'message' | 'transition' | 'done'>('burst');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('message'), 600),
      setTimeout(() => setPhase('transition'), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    return {
      id: i,
      x: Math.cos(angle),
      y: Math.sin(angle),
      delay: Math.random() * 0.2,
    };
  });

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Particle burst */}
      <AnimatePresence>
        {phase === 'burst' && (
          <div className="absolute inset-0">
            {particles.map(p => (
              <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Glow pulse at center */}
      {phase === 'burst' && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(233, 30, 99, 0.3) 0%, transparent 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 2.5], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      )}

      {/* "Beautiful!" text */}
      <AnimatePresence>
        {phase === 'message' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p
              className="text-5xl md:text-6xl"
              style={{
                fontFamily: 'var(--font-script)',
                color: '#fce4ec',
                textShadow: '0 0 30px rgba(233, 30, 99, 0.5), 0 0 60px rgba(233, 30, 99, 0.3)',
              }}
            >
              Beautiful!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced heart transition: glow → 3D morph → heartbeat → zoom */}
      {phase === 'transition' && (
        <HeartCompletionTransition onFinished={onFinished} />
      )}
    </div>
  );
}
