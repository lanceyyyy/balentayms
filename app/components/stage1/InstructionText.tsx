'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { DrawingState } from '../../types';

interface InstructionTextProps {
  drawingState: DrawingState;
  completionPercentage: number;
}

export default function InstructionText({
  drawingState,
  completionPercentage,
}: InstructionTextProps) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-end pb-16">
      <AnimatePresence mode="wait">
        {drawingState === 'idle' && (
          <motion.div
            key="idle"
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-3xl md:text-4xl tracking-wide"
              style={{ fontFamily: 'var(--font-script)', color: '#fce4ec' }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Draw a heart for me
            </motion.p>
            <motion.p
              className="text-sm mt-3 tracking-widest uppercase"
              style={{ color: 'rgba(255, 182, 193, 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              trace the outline
            </motion.p>
          </motion.div>
        )}

        {drawingState === 'drawing' && (
          <motion.div
            key="drawing"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{
                  width: '120px',
                  background: 'rgba(255, 182, 193, 0.15)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #e91e63, #ff69b4)' }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span
                className="text-xs tracking-widest uppercase"
                style={{ color: 'rgba(255, 182, 193, 0.5)' }}
              >
                {completionPercentage < 50
                  ? 'keep going...'
                  : completionPercentage < 80
                  ? 'almost there!'
                  : 'just a bit more...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
