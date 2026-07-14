'use client';

import { Suspense } from 'react';
import { Box, Button, Chip, Link, Typography } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';

const DOCTOR_MODEL_PATH = '/models/doctor.glb';

function LoadingOverlay() {
  const { progress } = useProgress();

  return (
    <Html center>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: '10px',
          bgcolor: 'rgba(255,255,255,0.94)',
          border: '1px solid #fed7aa',
          boxShadow: '0 10px 28px rgba(15,23,42,0.10)',
          minWidth: 210,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
          Loading full doctor.glb
        </Typography>
        <Typography sx={{ color: '#9a3412', fontSize: '0.8rem', mt: 0.25 }}>
          {Math.round(progress)}% loaded
        </Typography>
      </Box>
    </Html>
  );
}

function DoctorFullModel() {
  const gltf = useGLTF(DOCTOR_MODEL_PATH);
  return <primitive object={gltf.scene} />;
}

function DoctorFullCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.35, 4.2], fov: 30 }}
      dpr={1}
      frameloop="demand"
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#eff6ff', '#e2e8f0', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={2.0} />
      <directionalLight position={[-4, 2, 3]} intensity={0.75} />

      <Suspense fallback={<LoadingOverlay />}>
        <Bounds fit clip observe margin={1.18}>
          <Center>
            <DoctorFullModel />
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

export default function DoctorViewerFullPage() {
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
          bgcolor: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Chip
            label="Full GLB Test"
            size="small"
            sx={{
              mb: 0.8,
              bgcolor: '#fff7ed',
              color: '#9a3412',
              border: '1px solid #fed7aa',
              fontWeight: 700,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0 }}>
            Full Doctor Model
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.92rem', mt: 0.35 }}>
            Rendering the original full-size GLB. This route is heavier than the compressed viewer.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/doctor-viewer"
            underline="none"
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
          >
            Compressed Viewer
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
            'radial-gradient(circle at 50% 18%, rgba(254,215,170,0.65), rgba(248,250,252,0.35) 34%, rgba(248,250,252,0) 62%)',
        }}
      >
        <DoctorFullCanvas />
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
            /models/doctor.glb
          </Box>
          {' '}This file is much larger, so use the compressed viewer for normal demos.
        </Typography>
      </Box>
    </Box>
  );
}
