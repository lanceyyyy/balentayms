'use client';

import { Canvas } from '@react-three/fiber';
import { Stars, AdaptiveDpr } from '@react-three/drei';

function Scene() {
  return (
    <>
      <Stars radius={50} depth={30} count={1500} factor={4} fade speed={0.3} />
      <ambientLight intensity={0.1} color="#ffb6c1" />
      <AdaptiveDpr pixelated />
    </>
  );
}

export default function StarfieldBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #0d0818 0%, #050510 50%, #020208 100%)',
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
