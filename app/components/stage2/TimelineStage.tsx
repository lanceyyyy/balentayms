'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import PolaroidCard from './PolaroidCard';
import { memories } from '../../lib/timelineData';

const TimelineBackground = dynamic(() => import('./TimelineBackground'), { ssr: false });

interface TimelineStageProps {
  onComplete: () => void;
}

export default function TimelineStage({ onComplete }: TimelineStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  const isLastCard = currentIndex === memories.length - 1;

  const advance = useCallback(() => {
    if (isLastCard) {
      if (!isFlipped) {
        setIsFlipped(true);
        // After flip, wait then transition
        setTimeout(() => onComplete(), 3000);
      }
      return;
    }
    setCurrentIndex(prev => Math.min(prev + 1, memories.length - 1));
  }, [isLastCard, isFlipped, onComplete]);

  // Handle tap/click to advance
  const handleTap = useCallback(() => {
    advance();
  }, [advance]);

  // Parallax on mouse/pointer move
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTiltX(-y * 3);
      setTiltY(x * 3);
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden cursor-pointer"
      style={{ background: '#0d0208' }}
      onClick={handleTap}
    >
      <TimelineBackground />

      {/* Title */}
      <motion.div
        className="absolute top-8 left-0 right-0 z-20 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: currentIndex === 0 ? 1 : 0.5, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p
          className="text-2xl md:text-3xl"
          style={{
            fontFamily: 'var(--font-script)',
            color: '#fce4ec',
            textShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
          }}
        >
          Our Story
        </p>
      </motion.div>

      {/* Parallax container */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        style={{ perspective: 1000 }}
      >
        {/* Card stack */}
        {memories.map((memory, index) => (
          <PolaroidCard
            key={memory.id}
            memory={memory}
            isActive={index === currentIndex}
            isLast={index === memories.length - 1}
            isFlipped={index === memories.length - 1 && isFlipped}
            onFlip={() => setIsFlipped(true)}
            index={index}
            totalCards={memories.length}
            currentIndex={currentIndex}
          />
        ))}
      </motion.div>

      {/* Navigation hint */}
      <AnimatePresence>
        {!isFlipped && (
          <motion.div
            className="absolute bottom-8 left-0 right-0 z-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(255, 182, 193, 0.4)' }}
            >
              {isLastCard ? 'tap to reveal' : 'tap to continue'}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {memories.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === currentIndex ? 8 : 4,
                    height: 4,
                    background: i <= currentIndex
                      ? 'rgba(233, 30, 99, 0.8)'
                      : 'rgba(255, 182, 193, 0.2)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
