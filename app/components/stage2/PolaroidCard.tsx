'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { MemoryEntry } from '../../lib/timelineData';
import { FLIP_MESSAGE } from '../../lib/timelineData';

interface PolaroidCardProps {
  memory: MemoryEntry;
  isActive: boolean;
  isLast: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  index: number;
  totalCards: number;
  currentIndex: number;
}

export default function PolaroidCard({
  memory,
  isActive,
  isLast,
  isFlipped,
  onFlip,
  index,
  currentIndex,
}: PolaroidCardProps) {
  const [imgError, setImgError] = useState(false);
  const offset = index - currentIndex;

  // Cards behind stack with offset
  const stackStyles = {
    scale: isActive ? 1 : 0.9 - Math.abs(offset) * 0.05,
    y: isActive ? 0 : offset < 0 ? -30 : 30,
    opacity: isActive ? 1 : Math.max(0, 0.3 - Math.abs(offset) * 0.1),
    rotateZ: isActive ? memory.rotation : memory.rotation + offset * 2,
    zIndex: isActive ? 10 : 5 - Math.abs(offset),
  };

  return (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, y: 80, scale: 0.8 }}
      animate={{
        ...stackStyles,
        transition: { duration: 0.6, ease: 'easeOut' },
      }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className="relative cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          width: 'clamp(300px, 80vw, 420px)',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        onClick={isActive && isLast ? onFlip : undefined}
      >
        {/* Front face */}
        <div
          className="relative rounded-sm"
          style={{
            backfaceVisibility: 'hidden',
            background: '#fff',
            padding: '12px 12px 16px 12px',
            boxShadow: '0 4px 25px rgba(0,0,0,0.3), 0 0 40px rgba(233, 30, 99, 0.1)',
          }}
        >
          {/* Image area */}
          <div
            className="w-full overflow-hidden"
            style={{
              aspectRatio: '1',
              background: imgError
                ? 'linear-gradient(135deg, #2d0a1a, #1a0610, #0d0208)'
                : '#f0f0f0',
            }}
          >
            {imgError ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <span
                  className="text-center text-lg"
                  style={{ fontFamily: 'var(--font-script)', color: '#f48fb1' }}
                >
                  {memory.caption || 'A memory...'}
                </span>
              </div>
            ) : (
              <img
                src={memory.imageSrc}
                alt={memory.caption}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>

        </div>

        {/* Back face (only for last card) */}
        {isLast && (
          <div
            className="absolute inset-0 rounded-sm flex items-center justify-center p-8"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1a0610, #2d0a1a)',
              boxShadow: '0 4px 25px rgba(0,0,0,0.3), 0 0 40px rgba(233, 30, 99, 0.15)',
            }}
          >
            <p
              className="text-center text-2xl md:text-3xl"
              style={{
                fontFamily: 'var(--font-script)',
                color: '#fce4ec',
                textShadow: '0 0 20px rgba(233, 30, 99, 0.4)',
              }}
            >
              {FLIP_MESSAGE}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
