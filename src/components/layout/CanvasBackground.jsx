import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rotating Wireframe Cubic Sculpture
function WireframeCube() {
  const groupRef = useRef(null);
  const cube1Ref = useRef(null);
  const cube2Ref = useRef(null);
  const cube3Ref = useRef(null);

  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      scrollRef.current = scrollY * 0.0015;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = scrollRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.12 + scrollOffset;
      groupRef.current.rotation.x = Math.sin(time * 0.08) * 0.15 + scrollOffset * 0.5;
    }

    if (cube1Ref.current) {
      cube1Ref.current.rotation.x = time * 0.15;
      cube1Ref.current.rotation.z = time * 0.08;
    }

    if (cube2Ref.current) {
      cube2Ref.current.rotation.y = -time * 0.18;
      cube2Ref.current.rotation.x = time * 0.06;
    }

    if (cube3Ref.current) {
      cube3Ref.current.rotation.z = time * 0.1;
      cube3Ref.current.rotation.x = -time * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 0, -2]}>
      {/* Outer Cubic Wireframe */}
      <mesh ref={cube1Ref}>
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        <meshBasicMaterial
          wireframe
          color="#ffffff"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Intermediate Rotated Wireframe */}
      <mesh ref={cube2Ref}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshBasicMaterial
          wireframe
          color="#d4d4d8"
          transparent
          opacity={0.09}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Dense Wireframe Lattice */}
      <mesh ref={cube3Ref}>
        <octahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial
          wireframe
          color="#ffffff"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function CanvasBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <WireframeCube />
      </Canvas>
    </div>
  );
}
