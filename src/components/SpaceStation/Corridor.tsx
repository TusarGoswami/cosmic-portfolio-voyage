import { useRef } from "react";
import * as THREE from "three";
import ControlPanel from "./ControlPanel";
import LEDStrip from "./LEDStrip";

const Corridor = () => {
  const corridorRef = useRef<THREE.Group>(null);

  // Create cylindrical corridor shape
  const corridorRadius = 3;
  const corridorLength = 12;

  return (
    <group ref={corridorRef}>
      {/* Main corridor cylinder - interior walls */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[corridorRadius, corridorRadius, corridorLength, 32, 1, true]} />
        <meshStandardMaterial
          color="#e8e8e8"
          side={THREE.BackSide}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Floor panels */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, corridorLength]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Floor grid pattern */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`floor-${i}`} position={[0, -2.49, -5 + i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 0.02]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      ))}

      {/* Ceiling support ribs - copper color like reference */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`rib-${i}`} position={[0, 0, -4 + i * 1.2]} rotation={[0, 0, 0]}>
          <torusGeometry args={[corridorRadius - 0.05, 0.08, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#B87333" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Wall panels - left side */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`panel-l-${i}`} position={[-2.2, 0.5, -4 + i * 1.5]} rotation={[0, Math.PI / 8, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Wall panels - right side */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`panel-r-${i}`} position={[2.2, 0.5, -4 + i * 1.5]} rotation={[0, -Math.PI / 8, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.1]} />
          <meshStandardMaterial color="#d0d0d0" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Control panels - left side */}
      <ControlPanel position={[-2.5, 0, 0]} rotation={[0, Math.PI / 6, 0]} side="left" />
      <ControlPanel position={[-2.4, 0, 3]} rotation={[0, Math.PI / 5, 0]} side="left" />

      {/* Control panels - right side */}
      <ControlPanel position={[2.5, 0, 0]} rotation={[0, -Math.PI / 6, 0]} side="right" />
      <ControlPanel position={[2.4, 0, 3]} rotation={[0, -Math.PI / 5, 0]} side="right" />

      {/* LED strips - horizontal along walls */}
      <LEDStrip position={[-2.3, -0.8, 1]} rotation={[0, Math.PI / 6, 0]} length={3} color="#00ffff" />
      <LEDStrip position={[2.3, -0.8, 1]} rotation={[0, -Math.PI / 6, 0]} length={3} color="#00ffff" />

      {/* LED strips - near floor */}
      <LEDStrip position={[-1.8, -2.3, 0]} rotation={[0, 0, 0]} length={8} color="#ffe066" />
      <LEDStrip position={[1.8, -2.3, 0]} rotation={[0, 0, 0]} length={8} color="#ffe066" />

      {/* Overhead lights */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`light-${i}`} position={[0, 2.7, -3 + i * 2]}>
          <mesh>
            <boxGeometry args={[0.6, 0.1, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} color="#ffffff" intensity={0.3} distance={4} />
        </group>
      ))}

      {/* Equipment boxes on walls */}
      <mesh position={[-2.6, 1.2, -2]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[2.6, 1.2, -2]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Cables and wiring */}
      {[
        { pos: [-2.7, 0.3, 2], color: "#ff4444" },
        { pos: [-2.75, 0.1, 2], color: "#44ff44" },
        { pos: [2.7, 0.3, 2], color: "#4444ff" },
        { pos: [2.75, 0.1, 2], color: "#ffff44" },
      ].map((cable, i) => (
        <mesh key={`cable-${i}`} position={cable.pos as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color={cable.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export default Corridor;
