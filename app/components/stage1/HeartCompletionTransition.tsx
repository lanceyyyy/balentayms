'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';

function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, -2);
  shape.bezierCurveTo(0, -2.8, -4.5, -4.5, -4.5, -1);
  shape.bezierCurveTo(-4.5, 1.5, -2, 3.5, 0, 5);
  shape.bezierCurveTo(2, 3.5, 4.5, 1.5, 4.5, -1);
  shape.bezierCurveTo(4.5, -4.5, 0, -2.8, 0, -2);
  return shape;
}

function BigHeart({ phase }: { phase: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const beatStartRef = useRef(0);

  const geometry = React.useMemo(() => {
    const shape = createHeartShape();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.8,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.15,
      bevelSegments: 3,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    if (phase === 'morph') {
      // Scale in from 0
      const s = Math.min(t * 0.8, 0.15);
      meshRef.current.scale.setScalar(s);
      meshRef.current.rotation.y = t * 0.3;
    }

    if (phase === 'heartbeat') {
      if (beatStartRef.current === 0) beatStartRef.current = t;
      const bt = t - beatStartRef.current;
      // Double-beat pattern
      const beat = 1 + 0.15 * Math.sin(bt * 8) * Math.exp(-bt * 2);
      meshRef.current.scale.setScalar(0.15 * beat);
      meshRef.current.rotation.y += 0.005;
    }

    if (phase === 'zoom') {
      // Camera zooms in
      const z = THREE.MathUtils.lerp(camera.position.z, 2, 0.03);
      camera.position.z = z;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[Math.PI, 0, 0]}
        scale={0}
      >
        <meshStandardMaterial
          color="#e91e63"
          emissive="#e91e63"
          emissiveIntensity={0.8}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

import React from 'react';

interface HeartCompletionTransitionProps {
  onFinished: () => void;
}

export default function HeartCompletionTransition({ onFinished }: HeartCompletionTransitionProps) {
  const [phase, setPhase] = useState<'glow' | 'morph' | 'heartbeat' | 'zoom' | 'done'>('glow');
  const { play } = useAudio();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('morph'), 1000),
      setTimeout(() => {
        setPhase('heartbeat');
        play('/audio/heartbeat.mp3', { volume: 0.4 });
      }, 2500),
      setTimeout(() => setPhase('zoom'), 3500),
      setTimeout(() => {
        setPhase('done');
        onFinished();
      }, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinished, play]);

  return (
    <div className="absolute inset-0 z-40">
      {/* Glow overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(233, 30, 99, 0.3) 0%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'glow' ? [0, 1, 0.8] : phase === 'zoom' ? 0 : 0.5,
        }}
        transition={{ duration: 1 }}
      />

      {/* 3D Heart */}
      {(phase === 'morph' || phase === 'heartbeat' || phase === 'zoom') && (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 12], fov: 60 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true }}
          >
            <ambientLight intensity={0.5} color="#ffb6c1" />
            <pointLight position={[0, 0, 8]} intensity={1.5} color="#ff69b4" />
            <BigHeart phase={phase} />
          </Canvas>
        </div>
      )}

      {/* Pink background shift */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: phase === 'heartbeat' || phase === 'zoom'
            ? 'linear-gradient(135deg, #1a0610, #2d0a1a, #1a0610)'
            : '#0d0208',
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Bright flash for zoom transition */}
      {phase === 'zoom' && (
        <motion.div
          className="absolute inset-0"
          style={{ background: '#fce4ec' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      )}
    </div>
  );
}
