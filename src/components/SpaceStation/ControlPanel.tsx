import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ControlPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  side: "left" | "right";
}

const ControlPanel = ({ position, rotation = [0, 0, 0], side }: ControlPanelProps) => {
  const screenRef = useRef<THREE.Mesh>(null);
  const ledRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    // Flickering screen effect
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }

    // Blinking LEDs
    ledRefs.current.forEach((led, i) => {
      if (led) {
        const material = led.material as THREE.MeshStandardMaterial;
        const phase = state.clock.elapsedTime + i * 0.5;
        material.emissiveIntensity = 0.5 + Math.sin(phase * 2) * 0.5;
      }
    });
  });

  const mirrorX = side === "right" ? -1 : 1;

  return (
    <group position={position} rotation={rotation}>
      {/* Main panel body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.1, 0.06]}>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial
          color="#001a33"
          emissive="#0066cc"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Screen content - grid lines */}
      <mesh position={[0, 0.1, 0.08]}>
        <planeGeometry args={[0.75, 0.35]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} wireframe />
      </mesh>

      {/* LED indicators row */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[-0.3 + i * 0.2, -0.2, 0.06]}
          ref={(el) => {
            if (el) ledRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#00ff00" : "#ff3300"}
            emissive={i % 2 === 0 ? "#00ff00" : "#ff3300"}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Buttons */}
      {[0, 1, 2].map((i) => (
        <mesh key={`btn-${i}`} position={[0.4 * mirrorX, -0.2 + i * 0.12, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Side cables */}
      <mesh position={[0.5 * mirrorX, 0, -0.05]} rotation={[0, 0, Math.PI / 6 * mirrorX]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#ff4444" roughness={0.8} />
      </mesh>
      <mesh position={[0.55 * mirrorX, -0.1, -0.05]} rotation={[0, 0, Math.PI / 4 * mirrorX]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#ffff00" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default ControlPanel;
