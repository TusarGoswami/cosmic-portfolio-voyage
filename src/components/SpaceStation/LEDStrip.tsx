import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LEDStripProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  color?: string;
}

const LEDStrip = ({ 
  position, 
  rotation = [0, 0, 0], 
  length = 4,
  color = "#00ffff" 
}: LEDStripProps) => {
  const stripRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (stripRef.current) {
      const material = stripRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* LED strip base */}
      <mesh>
        <boxGeometry args={[length, 0.05, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* LED light */}
      <mesh ref={stripRef} position={[0, 0, 0.02]}>
        <boxGeometry args={[length - 0.1, 0.03, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0.05]}>
        <planeGeometry args={[length + 0.2, 0.3]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for actual illumination */}
      <pointLight
        position={[0, 0, 0.2]}
        color={color}
        intensity={0.5}
        distance={2}
        decay={2}
      />
    </group>
  );
};

export default LEDStrip;
