'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateHeartPoints } from '../../lib/heartMath';
import { textToParticlePositions } from '../../lib/constellationPaths';

const PARTICLE_COUNT = 2500;

interface StarfieldSceneProps {
  phase: 'forming' | 'hearts' | 'text' | 'fadeout';
}

export default function StarfieldScene({ phase }: StarfieldSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const { positions, targets, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const tgt = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random star positions
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      tgt[i * 3] = pos[i * 3];
      tgt[i * 3 + 1] = pos[i * 3 + 1];
      tgt[i * 3 + 2] = pos[i * 3 + 2];

      sz[i] = 1 + Math.random() * 2;
    }

    return { positions: pos, targets: tgt, sizes: sz };
  }, []);

  // Heart targets
  const heartTargets = useMemo(() => {
    const hearts: { x: number; y: number; z: number }[][] = [];
    const configs = [
      { cx: 0, cy: 1, cz: -2, scale: 0.15 },
      { cx: -4, cy: -1, cz: -5, scale: 0.08 },
      { cx: 5, cy: 2, cz: -4, scale: 0.1 },
    ];

    for (const cfg of configs) {
      const pts = generateHeartPoints(60, 0, 0, cfg.scale);
      hearts.push(pts.map(p => ({
        x: p.x + cfg.cx,
        y: -p.y + cfg.cy,
        z: cfg.cz,
      })));
    }
    return hearts;
  }, []);

  // Text targets (computed on client only)
  const [textTargets, setTextTargets] = useState<{ x: number; y: number; z: number }[]>([]);
  useEffect(() => {
    const pts = textToParticlePositions("There's just one more thing...", 600);
    setTextTargets(pts);
  }, []);

  // Update targets when phase changes
  useEffect(() => {
    if (phase === 'hearts') {
      const allHeartPts = heartTargets.flat();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < allHeartPts.length) {
          targets[i * 3] = allHeartPts[i].x;
          targets[i * 3 + 1] = allHeartPts[i].y;
          targets[i * 3 + 2] = allHeartPts[i].z;
        }
        // Others keep drifting as stars
      }
    } else if (phase === 'text') {
      // Reset non-text particles to random
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < textTargets.length) {
          targets[i * 3] = textTargets[i].x;
          targets[i * 3 + 1] = textTargets[i].y;
          targets[i * 3 + 2] = textTargets[i].z;
        } else {
          targets[i * 3] = (Math.random() - 0.5) * 30;
          targets[i * 3 + 1] = (Math.random() - 0.5) * 20;
          targets[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
    } else if (phase === 'forming') {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        targets[i * 3] = (Math.random() - 0.5) * 30;
        targets[i * 3 + 1] = (Math.random() - 0.5) * 20;
        targets[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
  }, [phase, heartTargets, textTargets, targets]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    const lerpSpeed = phaseRef.current === 'hearts' || phaseRef.current === 'text' ? 1.5 : 0.1;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Lerp toward target
      arr[i3] += (targets[i3] - arr[i3]) * delta * lerpSpeed;
      arr[i3 + 1] += (targets[i3 + 1] - arr[i3 + 1]) * delta * lerpSpeed;
      arr[i3 + 2] += (targets[i3 + 2] - arr[i3 + 2]) * delta * lerpSpeed;

      // Twinkle for stars (particles not forming shapes)
      if (phaseRef.current === 'forming') {
        arr[i3 + 1] += Math.sin(time + i) * 0.001;
      }
    }

    posAttr.needsUpdate = true;

    // Fade out in fadeout phase
    if (phaseRef.current === 'fadeout') {
      mat.opacity = Math.max(0, mat.opacity - delta * 0.5);
    } else {
      mat.opacity = Math.min(1, mat.opacity + delta * 2);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        color="#ffb6c1"
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
