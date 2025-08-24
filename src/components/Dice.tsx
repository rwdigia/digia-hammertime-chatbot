import { OrbitControls, PerspectiveCamera, RenderTexture, RoundedBox, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Cube({ roll }: { roll: number }) {
  const textRef = useRef<THREE.Object3D>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.x = Math.sin(state.clock.elapsedTime);
    }
  });

  return (
    <mesh>
      <RoundedBox args={[1.7, 1.7, 1.7]} radius={0.2} smoothness={2} castShadow>
        <meshStandardMaterial>
          <RenderTexture attach="map" anisotropy={16}>
            <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
            <color attach="background" args={['white']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} />
            <Text ref={textRef} fontSize={5} color="#333">
              {roll}
            </Text>
          </RenderTexture>
        </meshStandardMaterial>
      </RoundedBox>
    </mesh>
  );
}

export default function Dice({ roll }: { roll: number }) {
  return (
    <>
      <div className="h-[300px]">
        <Canvas camera={{ position: [5, 5, 5], fov: 25 }}>
          <ambientLight intensity={5} />
          <Cube roll={roll} />
          <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </div>
      <div className="text-center text-sm">
        <span className="font-bold">Tip!</span> Try spinning the dice.
      </div>
    </>
  );
}
