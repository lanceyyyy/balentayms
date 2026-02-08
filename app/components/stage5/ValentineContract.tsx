'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import SignatureCanvas from './SignatureCanvas';

interface ValentineContractProps {
  onSigned: () => void;
}

export default function ValentineContract({ onSigned }: ValentineContractProps) {
  const [signed, setSigned] = useState(false);

  const handleSigned = useCallback(() => {
    setSigned(true);
    setTimeout(onSigned, 2000);
  }, [onSigned]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="w-full max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      {/* Contract card */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 10, 20, 0.95) 0%, rgba(15, 5, 15, 0.98) 100%)',
          border: '1px solid rgba(233, 30, 99, 0.2)',
          boxShadow: '0 0 60px rgba(233, 30, 99, 0.1), inset 0 0 30px rgba(233, 30, 99, 0.05)',
        }}
      >
        {/* Corner ornaments */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l" style={{ borderColor: 'rgba(233, 30, 99, 0.3)' }} />
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r" style={{ borderColor: 'rgba(233, 30, 99, 0.3)' }} />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l" style={{ borderColor: 'rgba(233, 30, 99, 0.3)' }} />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r" style={{ borderColor: 'rgba(233, 30, 99, 0.3)' }} />

        <div className="px-8 py-10 md:px-10 md:py-12">
          {/* Title */}
          <motion.h2
            className="text-center text-2xl md:text-3xl mb-2"
            style={{
              fontFamily: 'var(--font-script)',
              color: '#fce4ec',
              textShadow: '0 0 20px rgba(233, 30, 99, 0.3)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Valentine&apos;s Agreement
          </motion.h2>

          <motion.div
            className="w-16 h-px mx-auto mb-8"
            style={{ background: 'linear-gradient(90deg, transparent, #e91e63, transparent)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Contract body */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{
                fontFamily: 'var(--font-romantic)',
                color: 'rgba(252, 228, 236, 0.85)',
              }}
            >
              On this day, <span style={{ color: '#f48fb1' }}>{dateStr}</span>, I hereby acknowledge and confirm
              the following to be irrevocably true:
            </p>

            <div className="space-y-3 pl-4" style={{ fontFamily: 'var(--font-romantic)', color: 'rgba(252, 228, 236, 0.75)', fontSize: '0.875rem' }}>
              <p>
                <span style={{ color: '#e91e63' }}>I.</span>{' '}
                I agree to be the official Valentine of the person who made this, effective immediately and with no expiration date.
              </p>
              <p>
                <span style={{ color: '#e91e63' }}>II.</span>{' '}
                I promise unlimited hugs, kisses, and reassurance.
              </p>
              <p>
                <span style={{ color: '#e91e63' }}>III.</span>{' '}
                I acknowledge that I love you.
              </p>
              <p>
                <span style={{ color: '#e91e63' }}>IV.</span>{' '}
                I agree to laugh at all jokes, even the terrible ones, and to pretend they&apos;re funny every single time.
              </p>
              <p>
                <span style={{ color: '#e91e63' }}>V.</span>{' '}
                I confirm that this Valentine holds a permanent reservation in my heart, no cancellations allowed.
              </p>
            </div>
          </motion.div>

          {/* Signature area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div
              className="flex items-center justify-between mb-2"
            >
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255, 182, 193, 0.4)' }}
              >
                Sign below to seal the deal
              </p>
              {signed && (
                <motion.span
                  className="text-xs"
                  style={{ color: '#e91e63' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  Signed ✓
                </motion.span>
              )}
            </div>

            {/* Signature canvas */}
            <div
              className="relative rounded"
              style={{
                height: '100px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 182, 193, 0.2)',
              }}
            >
              <SignatureCanvas onSigned={handleSigned} />

              {/* Signature line */}
              <div
                className="absolute bottom-6 left-6 right-6 h-px"
                style={{ background: 'rgba(255, 182, 193, 0.15)' }}
              />
              <p
                className="absolute bottom-1 right-6 text-xs"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: 'rgba(255, 182, 193, 0.25)',
                }}
              >
                signature
              </p>
            </div>

            {/* Date line */}
            <div className="flex justify-between mt-4">
              <p
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-romantic)',
                  color: 'rgba(252, 228, 236, 0.5)',
                }}
              >
                Date: {dateStr}
              </p>
              <p
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: 'rgba(252, 228, 236, 0.3)',
                }}
              >
                ♥ Binding Forever ♥
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sealed message after signing */}
      {signed && (
        <motion.p
          className="text-center mt-6 text-lg"
          style={{
            fontFamily: 'var(--font-script)',
            color: '#f48fb1',
            textShadow: '0 0 20px rgba(233, 30, 99, 0.4)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          It&apos;s official now. No take-backs.
        </motion.p>
      )}
    </motion.div>
  );
}
