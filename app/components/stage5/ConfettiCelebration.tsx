'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 400;
const COLORS = ['#ff69b4', '#e91e63', '#ff1493', '#f48fb1', '#ffd700', '#ffffff', '#ff80ab', '#ec407a'];

function ConfettiParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 5 + 5,
      z: (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 8 + 4,
      vz: (Math.random() - 0.5) * 2,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      rvx: (Math.random() - 0.5) * 8,
      rvy: (Math.random() - 0.5) * 8,
      rvz: (Math.random() - 0.5) * 8,
      sx: 0.05 + Math.random() * 0.1,
      sy: 0.08 + Math.random() * 0.12,
    }));
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(CONFETTI_COUNT * 3);
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const p = particles[i];

      // Gravity and air resistance
      p.vy -= 9.8 * delta;
      p.vx *= 0.999;
      p.vz *= 0.999;

      // Gentle side drift
      p.vx += Math.sin(p.y * 0.5) * delta * 0.5;

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;

      // Rotation
      p.rx += p.rvx * delta;
      p.ry += p.rvy * delta;
      p.rz += p.rvz * delta;

      // Respawn when fallen below
      if (p.y < -10) {
        p.x = (Math.random() - 0.5) * 20;
        p.y = 10 + Math.random() * 5;
        p.z = (Math.random() - 0.5) * 10;
        p.vy = Math.random() * 3 + 1;
        p.vx = (Math.random() - 0.5) * 4;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.sx, p.sy, 0.01);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CONFETTI_COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colors, 3]} />
    </instancedMesh>
  );
}

export default function ConfettiCelebration() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ConfettiParticles />
        <ambientLight intensity={1} />
      </Canvas>
    </div>
  );
}
