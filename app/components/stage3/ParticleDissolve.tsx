'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleDissolveSceneProps {
  pixels: { x: number; y: number }[];
  onComplete: () => void;
}

function Particles({ pixels, onComplete }: ParticleDissolveSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(0);
  const completed = useRef(false);

  const { positions, velocities } = useMemo(() => {
    const count = pixels.length;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const px = (pixels[i].x / window.innerWidth - 0.5) * 10;
      const py = -(pixels[i].y / window.innerHeight - 0.5) * 6;

      pos[i * 3] = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = 0;

      const angle = Math.atan2(py, px) + (Math.random() - 0.5) * 1.5;
      const speed = 1 + Math.random() * 3;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.sin(angle) * speed + 2;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    return { positions: pos, velocities: vel };
  }, [pixels]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    if (startTime.current === 0) startTime.current = state.clock.elapsedTime;

    const elapsed = state.clock.elapsedTime - startTime.current;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < pixels.length; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3] * 0.016;
      arr[i3 + 1] += velocities[i3 + 1] * 0.016;
      arr[i3 + 2] += velocities[i3 + 2] * 0.016;

      // Swirl
      const x = arr[i3];
      const y = arr[i3 + 1];
      const angularSpeed = 0.5;
      const cos = Math.cos(angularSpeed * 0.016);
      const sin = Math.sin(angularSpeed * 0.016);
      arr[i3] = x * cos - y * sin;
      arr[i3 + 1] = x * sin + y * cos;

      // Upward drift
      arr[i3 + 1] += 0.02;
    }

    posAttr.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - elapsed / 2.5);

    if (elapsed > 3 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#ff69b4"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface ParticleDissolveProps {
  pixels: { x: number; y: number }[];
  onComplete: () => void;
}

export default function ParticleDissolve({ pixels, onComplete }: ParticleDissolveProps) {
  // Always call hooks unconditionally
  useEffect(() => {
    if (pixels.length === 0) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [pixels, onComplete]);

  if (pixels.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <Particles pixels={pixels} onComplete={onComplete} />
      </Canvas>
    </div>
  );
}
