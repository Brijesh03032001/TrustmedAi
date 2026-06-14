'use client';

import React, { Suspense, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei';
import { Group } from 'three';

const ROBOT_MODEL_PATH = '/models/robotBlueeyes.glb';
export type RobotAnimationMode = 'idle' | 'thinking' | 'speaking' | 'recording';

interface RobotAvatar3DProps {
  size?: number | string;
  compact?: boolean;
  active?: boolean;
  mode?: RobotAnimationMode;
}

function modeConfig(mode: RobotAnimationMode) {
  switch (mode) {
    case 'thinking':
      return {
        speed: 1.65,
        bob: 0.09,
        yaw: 0.2,
        roll: 0.08,
        scale: 0.04,
        light: '#60a5fa',
        lightIntensity: 2.1,
      };
    case 'speaking':
      return {
        speed: 4.8,
        bob: 0.12,
        yaw: 0.12,
        roll: 0.05,
        scale: 0.085,
        light: '#22d3ee',
        lightIntensity: 2.6,
      };
    case 'recording':
      return {
        speed: 2.8,
        bob: 0.1,
        yaw: 0.28,
        roll: 0.1,
        scale: 0.06,
        light: '#ef4444',
        lightIntensity: 2.4,
      };
    default:
      return {
        speed: 0.75,
        bob: 0.045,
        yaw: 0.08,
        roll: 0.025,
        scale: 0.018,
        light: '#93c5fd',
        lightIntensity: 1.45,
      };
  }
}

function RobotModel({ mode, compact }: { mode: RobotAnimationMode; compact: boolean }) {
  const gltf = useGLTF(ROBOT_MODEL_PATH);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const groupRef = useRef<Group>(null);
  const haloRef = useRef<Group>(null);
  const config = modeConfig(mode);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const halo = haloRef.current;
    if (!group) return;

    const t = clock.elapsedTime;
    const beat = Math.sin(t * config.speed);
    const softBeat = Math.sin(t * config.speed * 0.55);

    group.position.y = beat * config.bob;
    group.rotation.y = softBeat * config.yaw + t * (compact ? 0.08 : 0.12);
    group.rotation.x = Math.sin(t * config.speed * 0.7) * config.roll;
    group.rotation.z = Math.cos(t * config.speed * 0.5) * config.roll;

    const pulse = 1 + Math.max(0, beat) * config.scale;
    group.scale.setScalar(pulse);

    if (halo) {
      halo.rotation.z = t * (mode === 'recording' ? 1.3 : 0.55);
      const haloScale = 1 + Math.max(0, Math.sin(t * config.speed * 0.9)) * (mode === 'speaking' ? 0.2 : 0.12);
      halo.scale.setScalar(haloScale);
    }
  });

  return (
    <>
      <group ref={haloRef} position={[0, 0.02, -0.04]}>
        <mesh>
          <torusGeometry args={[compact ? 0.92 : 1.02, compact ? 0.012 : 0.018, 8, 80]} />
          <meshBasicMaterial color={config.light} transparent opacity={mode === 'idle' ? 0.16 : 0.36} />
        </mesh>
        {mode !== 'idle' && (
          <mesh rotation={[0, 0, Math.PI / 2.8]}>
            <torusGeometry args={[compact ? 1.06 : 1.18, compact ? 0.008 : 0.012, 8, 80]} />
            <meshBasicMaterial color={config.light} transparent opacity={0.22} />
          </mesh>
        )}
      </group>
      <pointLight position={[0, 0.85, 1.25]} color={config.light} intensity={config.lightIntensity} distance={4} />
      <group ref={groupRef}>
        <primitive object={model} />
      </group>
    </>
  );
}

function RobotFallback({ active }: { active?: boolean }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        bgcolor: active ? '#dbeafe' : '#eff6ff',
        border: '1px solid #bfdbfe',
        boxShadow: active ? '0 0 0 6px rgba(37,99,235,0.08)' : 'none',
      }}
    />
  );
}

export function RobotAvatar3D({
  size = 96,
  compact = false,
  active = false,
  mode = active ? 'thinking' : 'idle',
}: RobotAvatar3DProps) {
  const isActive = active || mode !== 'idle';
  const accentColor =
    mode === 'recording' ? '#fecaca' : mode === 'speaking' ? '#a5f3fc' : mode === 'thinking' ? '#bfdbfe' : '#dbeafe';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        bgcolor: mode === 'recording' ? '#fff1f2' : mode === 'speaking' ? '#ecfeff' : '#eaf4ff',
        border: compact ? `2px solid ${accentColor}` : `3px solid ${accentColor}`,
        boxShadow: isActive
          ? mode === 'recording'
            ? '0 0 0 6px rgba(239,68,68,0.10), 0 10px 30px rgba(239,68,68,0.18)'
            : mode === 'speaking'
              ? '0 0 0 6px rgba(34,211,238,0.12), 0 10px 30px rgba(8,145,178,0.20)'
              : '0 0 0 6px rgba(37,99,235,0.10), 0 10px 30px rgba(37,99,235,0.22)'
          : compact
            ? '0 2px 10px rgba(37,99,235,0.18)'
            : '0 8px 32px rgba(37,99,235,0.18)',
        flexShrink: 0,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        animation: isActive && !compact ? 'robotPulse 1.8s ease-in-out infinite' : 'none',
        '@keyframes robotPulse': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }}
    >
      <Suspense fallback={<RobotFallback active={active} />}>
        <Canvas
          camera={{ position: [0, 0.6, 3.2], fov: compact ? 34 : 30 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.15} />
          <directionalLight position={[2, 4, 4]} intensity={1.6} />
          <directionalLight position={[-3, 2, 2]} intensity={0.55} />
          <hemisphereLight args={['#dbeafe', '#1e293b', 0.7]} />
          <Bounds fit clip observe margin={compact ? 1.0 : 1.15}>
            <Center>
              <RobotModel mode={mode} compact={compact} />
            </Center>
          </Bounds>
          {!compact && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.8}
              autoRotate
              autoRotateSpeed={0.9}
            />
          )}
        </Canvas>
      </Suspense>
    </Box>
  );
}

useGLTF.preload(ROBOT_MODEL_PATH);
