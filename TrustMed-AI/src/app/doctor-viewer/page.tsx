'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Box, Button, Chip, Link, Typography } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, Center, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { Group } from 'three';

const DOCTOR_MODEL_PATH = '/models/doctor-compressed.glb';

function LoadingOverlay() {
  const { progress } = useProgress();

  return (
    <Html center>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: '10px',
          bgcolor: 'rgba(255,255,255,0.92)',
          border: '1px solid #dbeafe',
          boxShadow: '0 10px 28px rgba(15,23,42,0.10)',
          minWidth: 180,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
          Loading doctor model
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.25 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>
    </Html>
  );
}

function DoctorSceneModel() {
  const gltf = useGLTF(DOCTOR_MODEL_PATH);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const modelRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const model = modelRef.current;
    if (!model) return;

    const t = clock.elapsedTime;
    model.rotation.y = Math.sin(t * 0.35) * 0.08;
    model.position.y = Math.sin(t * 0.9) * 0.025;
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
    </group>
  );
}

function DoctorCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.35, 4.2], fov: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#eff6ff', '#e2e8f0', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={2.0} />
      <directionalLight position={[-4, 2, 3]} intensity={0.75} />
      <pointLight position={[0, 2.2, 2.2]} intensity={0.75} color="#93c5fd" />

      <Suspense fallback={<LoadingOverlay />}>
        <Bounds fit clip observe margin={1.18}>
          <Center>
            <DoctorSceneModel />
          </Center>
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.5}
        maxDistance={7}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.72}
      />
    </Canvas>
  );
}

export default function DoctorViewerPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: 'rgba(255,255,255,0.88)',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Chip
            label="Local Three.js Viewer"
            size="small"
            sx={{
              mb: 0.8,
              bgcolor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              fontWeight: 700,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0 }}>
            TrustMed-AI Doctor Model
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.92rem', mt: 0.35 }}>
            Rendering local GLB with custom React Three Fiber logic.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/doctor-embed"
            underline="none"
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
          >
            Basic Test
          </Button>
          <Button
            component={Link}
            href="/doctor-viewer-full"
            underline="none"
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
          >
            Full GLB
          </Button>
          <Button
            component={Link}
            href="/chat"
            underline="none"
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: 'none' }}
          >
            Back to Chat
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          background:
            'radial-gradient(circle at 50% 18%, rgba(219,234,254,0.95), rgba(248,250,252,0.35) 34%, rgba(248,250,252,0) 62%)',
        }}
      >
        <DoctorCanvas />
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.5,
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Typography sx={{ color: '#64748b', fontSize: '0.86rem' }}>
          Model source:{' '}
          <Box component="span" sx={{ fontFamily: 'monospace', color: '#334155' }}>
            /models/doctor-compressed.glb
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

useGLTF.preload(DOCTOR_MODEL_PATH);
