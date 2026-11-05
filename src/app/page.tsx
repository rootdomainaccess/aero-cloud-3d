'use client';

import { Canvas } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState, Suspense } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

function PCParts() {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const ledsRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        scroller: '#scroll-container',
      },
    });
    // refresh after creation
    ScrollTrigger.refresh();
    // move into view and rotate
    tl.to(groupRef.current.position, { y: 0, duration: 2 }, 0)
      .to(groupRef.current.rotation, { y: Math.PI * 2, duration: 3 }, 0)
      .to(screenRef.current?.scale || {}, { x: 1, y: 1, z: 1, duration: 1.5 }, 1.5)
      .to(ledsRef.current?.material || {}, { emissiveIntensity: 3, duration: 1 }, 2);
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* chassis */}
      <mesh>
        <boxGeometry args={[2.2, 3, 1.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* monitor */}
      <mesh ref={screenRef} position={[0, 0.2, 0.76]} scale={[0, 0, 0]}>
        <planeGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
      {/* LED strip */}
      <mesh ref={ledsRef} position={[0, -1.3, 0.77]}>
        <boxGeometry args={[1.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <main className="relative bg-black text-white min-h-screen">
      {/* loading overlay */}
      {!ready && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-cyan-400 font-mono text-xl animate-pulse">
          INITIALIZING AERO CLOUD...
        </div>
      )}
      {/* fixed canvas background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas style={{ background: 'black' }} camera={{ position: [0, 0, 5], fov: 60 }} onCreated={() => setReady(true)}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <Suspense fallback={null}>
            <Center>
              <PCParts />
            </Center>
          </Suspense>
        </Canvas>
      </div>
      {/* scrollable content */}
      <div id="scroll-container" className="relative z-10 flex flex-col" style={{ overflowY: 'auto', height: '100vh' }}>
        <section className="h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            AERO CLOUD
          </h1>
          <p className="mt-4 text-gray-400 max-w-md text-lg">Next‑Gen Distributed Cloud Architecture. Scroll to Initialize.</p>
        </section>
        <section className="h-screen flex items-center justify-start px-12 md:px-24">
          <div className="max-w-md bg-black/60 backdrop-blur-md p-8 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.1)]">
            <h2 className="text-3xl font-bold text-cyan-400">Precision Assembly</h2>
            <p className="mt-2 text-gray-300">Modular hardware seamlessly connecting into high‑performance cloud nodes.</p>
          </div>
        </section>
        <section className="h-screen flex items-center justify-end px-12 md:px-24">
          <div className="max-w-md bg-black/60 backdrop-blur-md p-8 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.1)]">
            <h2 className="text-3xl font-bold text-cyan-400">Powering On</h2>
            <p className="mt-2 text-gray-300">Instantaneous boot sequence with zero downtime and real‑time telemetry.</p>
          </div>
        </section>
        <section className="h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="bg-black/80 backdrop-blur-xl p-12 border border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(0,255,255,0.2)]">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Ready for Launch</h2>
            <p className="mt-4 text-cyan-400 font-mono">AERO CLOUD SYSTEMS ACTIVE</p>
          </div>
        </section>
      </div>
    </main>
  );
}
