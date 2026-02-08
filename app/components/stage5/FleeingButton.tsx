'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

interface FleeingButtonProps {
  onGiveUp?: () => void;
}

export default function FleeingButton({ onGiveUp }: FleeingButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [fleeCount, setFleeCount] = useState(0);
  const [scale, setScale] = useState(1);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const flee = useCallback(() => {
    if (fleeCount >= 5) return;

    const padding = 80;
    const maxX = window.innerWidth - padding * 2;
    const maxY = window.innerHeight - padding * 2;

    const newX = (Math.random() - 0.5) * maxX;
    const newY = (Math.random() - 0.5) * maxY;

    setPosition({ x: newX, y: newY });
    setFleeCount(prev => prev + 1);
    setScale(prev => Math.max(prev - 0.08, 0.5));
  }, [fleeCount]);

  const text = fleeCount >= 5 ? 'Fine...' : 'No';

  return (
    <motion.button
      ref={buttonRef}
      className="px-10 py-4 rounded-full text-xl font-medium cursor-pointer"
      style={{
        fontFamily: 'var(--font-romantic)',
        background: 'transparent',
        border: '2px solid rgba(255, 182, 193, 0.4)',
        color: '#f48fb1',
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: scale,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onHoverStart={flee}
      onPointerEnter={flee}
      onClick={() => {
        if (fleeCount >= 5 && onGiveUp) {
          onGiveUp();
        }
      }}
      whileHover={fleeCount < 5 ? {} : { scale: scale * 1.05 }}
    >
      {text}
    </motion.button>
  );
}
