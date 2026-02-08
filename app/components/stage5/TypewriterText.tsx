'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TypewriterTextProps {
  text: string;
  onComplete: () => void;
  speed?: number;
}

export default function TypewriterText({ text, onComplete, speed = 80 }: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (displayedLength >= text.length) {
      // Done typing - wait a beat, then notify
      const timer = setTimeout(() => {
        setShowCursor(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDisplayedLength(prev => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [displayedLength, text.length, speed, onComplete]);

  // Cursor blink
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (!showCursor) return;
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [showCursor]);

  return (
    <div className="text-center px-8">
      <p
        className="text-4xl md:text-6xl lg:text-7xl leading-tight"
        style={{
          fontFamily: 'var(--font-script)',
          color: '#fce4ec',
          textShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
        }}
      >
        {text.slice(0, displayedLength).split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {char}
          </motion.span>
        ))}
        {showCursor && (
          <span
            className="inline-block ml-1"
            style={{
              opacity: cursorVisible ? 1 : 0,
              color: '#ff69b4',
              transition: 'opacity 0.1s',
            }}
          >
            |
          </span>
        )}
      </p>
    </div>
  );
}
