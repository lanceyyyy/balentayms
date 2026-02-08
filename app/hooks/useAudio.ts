'use client';

import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number>(0);

  const play = useCallback((src: string, options?: { volume?: number; loop?: boolean }) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audio.volume = options?.volume ?? 0.5;
      audio.loop = options?.loop ?? false;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {
      // Gracefully handle missing audio files
    }
  }, []);

  const fadeIn = useCallback((src: string, options?: { duration?: number; targetVolume?: number; loop?: boolean }) => {
    try {
      const duration = options?.duration ?? 3000;
      const targetVolume = options?.targetVolume ?? 0.3;

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(src);
      audio.volume = 0;
      audio.loop = options?.loop ?? true;
      audioRef.current = audio;
      audio.play().catch(() => {});

      const steps = 60;
      const stepDuration = duration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          audio.volume = targetVolume;
          clearInterval(fadeIntervalRef.current);
        } else {
          audio.volume = Math.min(volumeStep * currentStep, 1);
        }
      }, stepDuration);
    } catch {
      // Gracefully handle missing audio files
    }
  }, []);

  const fadeOut = useCallback((duration: number = 2000) => {
    const audio = audioRef.current;
    if (!audio) return;

    const steps = 40;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    clearInterval(fadeIntervalRef.current);
    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        audio.pause();
        audio.volume = 0;
        clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);
      }
    }, stepDuration);
  }, []);

  const stop = useCallback(() => {
    clearInterval(fadeIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { play, fadeIn, fadeOut, stop };
}
