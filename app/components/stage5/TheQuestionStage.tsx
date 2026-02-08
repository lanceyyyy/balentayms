'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import TypewriterText from './TypewriterText';
import FleeingButton from './FleeingButton';
import ValentineContract from './ValentineContract';

const StarfieldBackground = dynamic(() => import('./StarfieldBackground'), { ssr: false });
const ConfettiCelebration = dynamic(() => import('./ConfettiCelebration'), { ssr: false });

interface TheQuestionStageProps {
  onComplete: () => void;
}

type Phase = 'typing' | 'buttons' | 'celebration' | 'contract' | 'sealed';

export default function TheQuestionStage({ onComplete }: TheQuestionStageProps) {
  const [phase, setPhase] = useState<Phase>('typing');
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const handleTypingComplete = useCallback(() => {
    setPhase('buttons');
  }, []);

  const handleYes = useCallback(() => {
    setPhase('celebration');
    setTimeout(() => setShowFinalMessage(true), 1500);
    setTimeout(() => setPhase('contract'), 4000);
  }, []);

  const handleContractSigned = useCallback(() => {
    setPhase('sealed');
  }, []);

  return (
    <div className="relative h-full w-full" style={{ background: '#050510' }}>
      <StarfieldBackground />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'typing' && (
            <motion.div
              key="typing"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TypewriterText
                text="Will you be my Valentine?"
                onComplete={handleTypingComplete}
              />
            </motion.div>
          )}

          {phase === 'buttons' && (
            <motion.div
              key="buttons"
              className="flex flex-col items-center gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="text-4xl md:text-6xl lg:text-7xl text-center px-8"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: '#fce4ec',
                  textShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
                }}
              >
                Will you be my Valentine?
              </p>

              <div className="flex items-center gap-8 relative">
                <motion.button
                  className="px-12 py-4 rounded-full text-xl font-medium cursor-pointer relative z-10"
                  style={{
                    fontFamily: 'var(--font-romantic)',
                    background: 'linear-gradient(135deg, #e91e63, #ff69b4)',
                    color: '#fff',
                    boxShadow: '0 0 30px rgba(233, 30, 99, 0.4)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(233, 30, 99, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleYes}
                >
                  Yes 💕
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FleeingButton />
                </motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'celebration' && (
            <motion.div
              key="celebration"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ background: 'transparent' }}
                animate={{
                  background: 'radial-gradient(ellipse at center, rgba(233, 30, 99, 0.15) 0%, transparent 70%)',
                }}
                transition={{ duration: 2 }}
              />

              <ConfettiCelebration />

              <AnimatePresence>
                {!showFinalMessage && (
                  <motion.p
                    className="text-5xl md:text-7xl"
                    style={{
                      fontFamily: 'var(--font-script)',
                      color: '#fce4ec',
                      textShadow: '0 0 40px rgba(233, 30, 99, 0.6), 0 0 80px rgba(233, 30, 99, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    💕
                  </motion.p>
                )}
              </AnimatePresence>

              {showFinalMessage && (
                <motion.div
                  className="text-center px-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <p
                    className="text-4xl md:text-6xl mb-4"
                    style={{
                      fontFamily: 'var(--font-script)',
                      color: '#fce4ec',
                      textShadow: '0 0 30px rgba(233, 30, 99, 0.4)',
                    }}
                  >
                    Best decision of your life.
                  </p>
                  <motion.p
                    className="text-lg mt-4"
                    style={{
                      fontFamily: 'var(--font-romantic)',
                      color: 'rgba(255, 182, 193, 0.5)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    But first... let&apos;s make it official.
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'contract' && (
            <motion.div
              key="contract"
              className="w-full py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <ValentineContract onSigned={handleContractSigned} />
            </motion.div>
          )}

          {phase === 'sealed' && (
            <motion.div
              key="sealed"
              className="flex flex-col items-center gap-6 text-center px-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <ConfettiCelebration />

              <motion.p
                className="text-5xl md:text-7xl"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: '#fce4ec',
                  textShadow: '0 0 40px rgba(233, 30, 99, 0.5), 0 0 80px rgba(233, 30, 99, 0.2)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Now it&apos;s official.
              </motion.p>

              <motion.p
                className="text-xl md:text-2xl"
                style={{
                  fontFamily: 'var(--font-romantic)',
                  color: 'rgba(252, 228, 236, 0.7)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Happy Valentine&apos;s Day
              </motion.p>

              <motion.p
                className="text-lg mt-4"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: 'rgba(255, 182, 193, 0.5)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                I love you ♥
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
