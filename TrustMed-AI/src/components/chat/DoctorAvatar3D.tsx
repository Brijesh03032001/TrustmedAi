'use client';

import React, { Suspense, useMemo, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei';
import { Group } from 'three';

export type DoctorAnimationMode = 'idle' | 'thinking' | 'speaking' | 'recording';

const DOCTOR_MODEL_PATH = '/models/doctor-compressed.glb';

interface DoctorAvatar3DProps {
  size?: number | string;
  compact?: boolean;
  mode?: DoctorAnimationMode;
  framed?: boolean;
  interactive?: boolean;
}

function animationConfig(mode: DoctorAnimationMode) {
  switch (mode) {
    case 'thinking':
      return { speed: 1.4, bob: 0.035, yaw: 0.12, scale: 0.018, light: '#2563eb', glow: 'rgba(37,99,235,0.28)' };
    case 'speaking':
      return { speed: 4.2, bob: 0.05, yaw: 0.08, scale: 0.035, light: '#06b6d4', glow: 'rgba(6,182,212,0.32)' };
    case 'recording':
      return { speed: 2.6, bob: 0.04, yaw: 0.16, scale: 0.025, light: '#dc2626', glow: 'rgba(220,38,38,0.26)' };
    default:
      return { speed: 0.85, bob: 0.018, yaw: 0.05, scale: 0.01, light: '#60a5fa', glow: 'rgba(96,165,250,0.18)' };
  }
}

function DoctorModel({ mode, compact }: { mode: DoctorAnimationMode; compact: boolean }) {
  const gltf = useGLTF(DOCTOR_MODEL_PATH);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const modelRef = useRef<Group>(null);
  const config = animationConfig(mode);

  useFrame(({ clock }) => {
    const model = modelRef.current;
    if (!model) return;

    const t = clock.elapsedTime;
    const pulse = Math.max(0, Math.sin(t * config.speed));
    model.position.y = Math.sin(t * config.speed * 0.65) * config.bob;
    model.rotation.y = Math.sin(t * config.speed * 0.35) * config.yaw;
    model.rotation.z = Math.cos(t * config.speed * 0.4) * (compact ? 0.01 : 0.025);
    model.scale.setScalar(1 + pulse * config.scale);
  });

  return (
    <>
      <pointLight position={[0, 1.6, 1.8]} color={config.light} intensity={compact ? 0.8 : 1.15} distance={5} />
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </>
  );
}

function DoctorFallback() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={18} sx={{ color: '#2563eb' }} />
    </Box>
  );
}

export function DoctorAvatar3D({
  size = 120,
  compact = false,
  mode = 'idle',
  framed = true,
  interactive = false,
}: DoctorAvatar3DProps) {
  const config = animationConfig(mode);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        borderRadius: framed ? '50%' : 0,
        overflow: 'hidden',
        bgcolor: framed ? 'rgba(255,255,255,0.72)' : 'transparent',
        border: framed ? '1px solid rgba(191,219,254,0.95)' : 'none',
        boxShadow: framed
          ? `0 0 0 7px ${config.glow}, 0 18px 48px rgba(37,99,235,0.16)`
          : 'none',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: interactive ? 'grab' : 'default',
        '&:active': {
          cursor: interactive ? 'grabbing' : 'default',
        },
        '&::before': framed
          ? {
              content: '""',
              position: 'absolute',
              inset: 7,
              borderRadius: '50%',
              border: `1px solid ${mode === 'recording' ? 'rgba(248,113,113,0.5)' : 'rgba(147,197,253,0.42)'}`,
              animation: mode === 'idle' ? 'none' : 'doctorRing 1.8s ease-in-out infinite',
              zIndex: 1,
            }
          : {},
        '@keyframes doctorRing': {
          '0%,100%': { transform: 'scale(0.96)', opacity: 0.45 },
          '50%': { transform: 'scale(1.04)', opacity: 0.92 },
        },
      }}
    >
      <Suspense fallback={<DoctorFallback />}>
        <Canvas
          camera={{
            position: [0, compact ? 1.4 : interactive ? 1.2 : 1.25, compact ? 4.1 : interactive ? 4.25 : 3.8],
            fov: compact ? 24 : interactive ? 25 : 27,
          }}
          dpr={compact ? 1 : [1, 1.5]}
          gl={{ antialias: !compact, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={1.05} />
          <hemisphereLight args={['#eff6ff', '#e2e8f0', 0.82]} />
          <directionalLight position={[3, 5, 4]} intensity={1.8} />
          <directionalLight position={[-3, 2, 2]} intensity={0.65} />
          <Bounds fit clip observe margin={compact ? 1.2 : interactive ? 1.08 : 1.12}>
            <Center>
              <DoctorModel mode={mode} compact={compact} />
            </Center>
          </Bounds>
          {interactive && (
            <OrbitControls
              enableZoom
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.65}
              zoomSpeed={0.7}
              minDistance={2.1}
              maxDistance={6.4}
              minPolarAngle={Math.PI * 0.18}
              maxPolarAngle={Math.PI * 0.82}
            />
          )}
        </Canvas>
      </Suspense>
    </Box>
  );
}

useGLTF.preload(DOCTOR_MODEL_PATH);
