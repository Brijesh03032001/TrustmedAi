'use client';

import { Suspense } from 'react';
import { Box, Button, Chip, CircularProgress, Link, Typography } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei';

const DOCTOR_MODEL_PATH = '/models/doctor-compressed.glb';

function DoctorModel() {
  const gltf = useGLTF(DOCTOR_MODEL_PATH);
  return <primitive object={gltf.scene} />;
}

function ModelLoading() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1.5,
        color: '#64748b',
        bgcolor: 'transparent',
      }}
    >
      <CircularProgress size={30} sx={{ color: '#60a5fa' }} />
      <Typography sx={{ fontSize: '0.95rem', color: '#64748b' }}>Loading local doctor-compressed.glb...</Typography>
    </Box>
  );
}

export default function DoctorEmbedPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        color: '#0f172a',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Chip
              label="Local GLB Test"
              size="small"
              sx={{
                mb: 1,
                bgcolor: '#ecfeff',
                color: '#0e7490',
                border: '1px solid #a5f3fc',
                fontWeight: 700,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0, color: '#0f172a' }}>
              3D Doctor Model
            </Typography>
            <Typography sx={{ mt: 0.75, color: '#64748b', maxWidth: 720, lineHeight: 1.6 }}>
              This page verifies whether the locally exported Blender model can be loaded from
              <Box component="span" sx={{ fontFamily: 'monospace', mx: 0.5 }}>
                /public/models/doctor-compressed.glb
              </Box>
              inside the TrustMed-AI frontend.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/chat"
            underline="none"
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              borderColor: '#cbd5e1',
              color: '#334155',
              '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' },
            }}
          >
            Back to Chat
          </Button>
        </Box>

        <Box
          sx={{
            width: '100%',
            aspectRatio: { xs: '4 / 5', sm: '16 / 10', lg: '16 / 9' },
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #dbeafe',
            bgcolor: 'transparent',
            boxShadow: '0 18px 48px rgba(15,23,42,0.14)',
            position: 'relative',
          }}
        >
          <Suspense fallback={<ModelLoading />}>
            <Canvas
              camera={{ position: [0, 1.5, 4.5], fov: 32 }}
              dpr={1}
              frameloop="demand"
              gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.9} />
              <hemisphereLight args={['#dbeafe', '#111827', 0.85]} />
              <directionalLight position={[3, 5, 4]} intensity={2.1} />
              <directionalLight position={[-4, 2, 2]} intensity={0.8} />
              <Bounds fit clip observe margin={1.12}>
                <Center>
                  <DoctorModel />
                </Center>
              </Bounds>
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.06}
                enablePan={false}
                minDistance={1.5}
                maxDistance={8}
              />
            </Canvas>
          </Suspense>
        </Box>

        <Typography sx={{ mt: 1.5, color: '#64748b', fontSize: '0.9rem' }}>
          Local model path:{' '}
          <Box component="span" sx={{ fontFamily: 'monospace', color: '#334155' }}>
            TrustMed-AI/public/models/doctor-compressed.glb
          </Box>
          . This optimized GLB is small enough for browser preview.
        </Typography>
      </Box>
    </Box>
  );
}
