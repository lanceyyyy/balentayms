'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useStageManager } from '../hooks/useStageManager';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import DrawHeartStage from './stage1/DrawHeartStage';

const TimelineStage = dynamic(() => import('./stage2/TimelineStage'), { ssr: false });
const WriteWithMeStage = dynamic(() => import('./stage3/WriteWithMeStage'), { ssr: false });
const BuildMomentStage = dynamic(() => import('./stage4/BuildMomentStage'), { ssr: false });
const TheQuestionStage = dynamic(() => import('./stage5/TheQuestionStage'), { ssr: false });
const HeartCursorTrail = dynamic(() => import('./shared/HeartCursorTrail'), { ssr: false });

const VOLUME_MAP: Record<string, number> = {
  'draw-heart': 0,
  'timeline': 0.25,
  'write-with-me': 0.25,
  'build-moment': 0.15,
  'the-question': 0.3,
};

export default function StageOrchestrator() {
  const { currentStage, advanceStage, onEnterComplete } = useStageManager();
  const { startMusic, adjustVolume } = useBackgroundMusic();

  // Adjust music volume based on current stage
  useEffect(() => {
    const target = VOLUME_MAP[currentStage];
    if (target !== undefined && target > 0) {
      adjustVolume(target, 2000);
    }
  }, [currentStage, adjustVolume]);

  // Start music callback passed to Stage 1
  const handleStage1Complete = () => {
    startMusic();
    advanceStage();
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <HeartCursorTrail />
      <AnimatePresence mode="wait">
        {currentStage === 'draw-heart' && (
          <motion.div
            key="stage-1"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'brightness(2)',
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <DrawHeartStage onComplete={handleStage1Complete} />
          </motion.div>
        )}
        {currentStage === 'timeline' && (
          <motion.div
            key="stage-2"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'brightness(3) blur(8px)' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            onAnimationComplete={onEnterComplete}
          >
            <TimelineStage onComplete={advanceStage} />
          </motion.div>
        )}
        {currentStage === 'write-with-me' && (
          <motion.div
            key="stage-3"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onAnimationComplete={onEnterComplete}
          >
            <WriteWithMeStage onComplete={advanceStage} />
          </motion.div>
        )}
        {currentStage === 'build-moment' && (
          <motion.div
            key="stage-4"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            onAnimationComplete={onEnterComplete}
          >
            <BuildMomentStage onComplete={advanceStage} />
          </motion.div>
        )}
        {currentStage === 'the-question' && (
          <motion.div
            key="stage-5"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            onAnimationComplete={onEnterComplete}
          >
            <TheQuestionStage onComplete={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
