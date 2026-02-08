'use client';

import { useRef, useCallback, useEffect } from 'react';

// Module-level singleton so music persists across remounts
let globalAudio: HTMLAudioElement | null = null;
let globalFadeInterval: number = 0;

export function useBackgroundMusic() {
  const startedRef = useRef(false);

  const startMusic = useCallback(() => {
    if (startedRef.current || globalAudio) return;
    startedRef.current = true;

    try {
      const audio = new Audio('/audio/background-music.mp3');
      audio.loop = true;
      audio.volume = 0;
      globalAudio = audio;
      audio.play().catch(() => {
        // Autoplay blocked or file missing - silently fail
        globalAudio = null;
        startedRef.current = false;
      });

      // Fade in to 0.25 over 5 seconds
      const steps = 100;
      const stepDuration = 5000 / steps;
      const targetVolume = 0.25;
      let currentStep = 0;

      clearInterval(globalFadeInterval);
      globalFadeInterval = window.setInterval(() => {
        currentStep++;
        if (!globalAudio) {
          clearInterval(globalFadeInterval);
          return;
        }
        if (currentStep >= steps) {
          globalAudio.volume = targetVolume;
          clearInterval(globalFadeInterval);
        } else {
          globalAudio.volume = Math.min((targetVolume / steps) * currentStep, 1);
        }
      }, stepDuration);
    } catch {
      // File not found - silently fail
    }
  }, []);

  const adjustVolume = useCallback((target: number, duration: number = 2000) => {
    if (!globalAudio) return;

    const startVolume = globalAudio.volume;
    const steps = 40;
    const stepDuration = duration / steps;
    const diff = target - startVolume;
    let currentStep = 0;

    clearInterval(globalFadeInterval);
    globalFadeInterval = window.setInterval(() => {
      currentStep++;
      if (!globalAudio) {
        clearInterval(globalFadeInterval);
        return;
      }
      if (currentStep >= steps) {
        globalAudio.volume = Math.max(0, Math.min(target, 1));
        clearInterval(globalFadeInterval);
      } else {
        globalAudio.volume = Math.max(0, Math.min(startVolume + (diff / steps) * currentStep, 1));
      }
    }, stepDuration);
  }, []);

  const stopMusic = useCallback(() => {
    clearInterval(globalFadeInterval);
    if (globalAudio) {
      globalAudio.pause();
      globalAudio = null;
    }
    startedRef.current = false;
  }, []);

  // Cleanup on unmount of the entire app
  useEffect(() => {
    return () => {
      // Don't stop music on component remount - only on full unmount
    };
  }, []);

  return { startMusic, adjustVolume, stopMusic };
}
