'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import FloatingHeart from './FloatingHeart';

function Scene() {
  const hearts = useMemo(() => {
    const items: {
      position: [number, number, number];
      scale: number;
      speed: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
    }[] = [];

    const colors = ['#e91e63', '#f06292', '#ec407a', '#d81b60', '#c2185b', '#ff80ab'];

    for (let i = 0; i < 18; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20 - 5,
        ],
        scale: 0.03 + Math.random() * 0.06,
        speed: 0.5 + Math.random() * 1.5,
        rotationSpeed: 0.2 + Math.random() * 0.5,
        opacity: 0.15 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return items;
  }, []);

  return (
    <>
      <fog attach="fog" args={['#1a0610', 8, 30]} />
      <ambientLight intensity={0.3} color="#ffb6c1" />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff69b4" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#e91e63" />
      <pointLight position={[0, 0, 8]} intensity={0.2} color="#ff1493" />

      {hearts.map((heart, i) => (
        <FloatingHeart key={i} {...heart} />
      ))}

      <Sparkles
        count={100}
        size={2}
        speed={0.3}
        color="#ff69b4"
        scale={20}
      />

      <Stars
        radius={50}
        depth={30}
        count={800}
        factor={3}
        fade
        speed={0.5}
      />

      <AdaptiveDpr pixelated />
      <PerformanceMonitor />
    </>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
