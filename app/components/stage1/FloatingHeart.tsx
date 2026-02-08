'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingHeartProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Heart shape using bezier curves
  shape.moveTo(0, -2);
  shape.bezierCurveTo(0, -2.8, -4.5, -4.5, -4.5, -1);
  shape.bezierCurveTo(-4.5, 1.5, -2, 3.5, 0, 5);
  shape.bezierCurveTo(2, 3.5, 4.5, 1.5, 4.5, -1);
  shape.bezierCurveTo(4.5, -4.5, 0, -2.8, 0, -2);
  return shape;
}

export default function FloatingHeart({
  position,
  scale,
  speed,
  rotationSpeed,
  opacity,
  color,
}: FloatingHeartProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const shape = createHeartShape();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.1,
      bevelSegments: 2,
    });
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
      meshRef.current.rotation.x += delta * rotationSpeed * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={position}
        scale={scale}
        rotation={[Math.PI, 0, 0]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}
