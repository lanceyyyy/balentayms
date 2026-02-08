'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars, AdaptiveDpr } from '@react-three/drei';

function Scene() {
  return (
    <>
      <fog attach="fog" args={['#0d0610', 5, 25]} />
      <ambientLight intensity={0.2} color="#ffb6c1" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#ff69b4" />
      <Sparkles count={50} size={1.5} speed={0.2} color="#ff69b4" scale={15} />
      <Stars radius={40} depth={20} count={500} factor={3} fade speed={0.3} />
      <AdaptiveDpr pixelated />
    </>
  );
}

export default function TimelineBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
