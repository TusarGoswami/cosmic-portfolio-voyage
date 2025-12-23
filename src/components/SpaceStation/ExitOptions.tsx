import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ExitOptionsProps {
  position?: [number, number, number];
  onSelectVehicle: (vehicle: "rocket" | "astronaut") => void;
}

const ExitOptions = ({ position = [0, 0, 4], onSelectVehicle }: ExitOptionsProps) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const rocketRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Floating animation for both models
    if (rocketRef.current) {
      rocketRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      rocketRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (astronautRef.current) {
      astronautRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 2 + 1) * 0.1;
      astronautRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* EXIT sign */}
      <group position={[0, 2, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.3}
          color="#ff3333"
          anchorX="center"
          anchorY="middle"
        >
          EXIT
        </Text>
        {/* Glowing border */}
        <mesh position={[0, 0, 0.05]}>
          <ringGeometry args={[0.9, 1, 4]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Platform */}
      <mesh ref={platformRef} position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* Platform glow ring */}
      <mesh position={[0, -2.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>

      {/* Rocket model - left side */}
      <group
        ref={rocketRef}
        position={[-1.5, -1, 0]}
        onClick={() => onSelectVehicle("rocket")}
        onPointerEnter={() => setHoveredOption("rocket")}
        onPointerLeave={() => setHoveredOption(null)}
      >
        {/* Rocket body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 1, 16]} />
          <meshStandardMaterial
            color={hoveredOption === "rocket" ? "#ff6600" : "#cccccc"}
            emissive={hoveredOption === "rocket" ? "#ff6600" : "#000000"}
            emissiveIntensity={hoveredOption === "rocket" ? 0.5 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Rocket nose */}
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.2, 0.4, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Rocket fins */}
        {[0, 120, 240].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.3,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.3,
            ]}
            rotation={[0, (-angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.02, 0.4, 0.2]} />
            <meshStandardMaterial color="#3366cc" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Rocket engine glow */}
        <pointLight position={[0, -0.2, 0]} color="#ff6600" intensity={1} distance={2} />

        {/* Label */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color={hoveredOption === "rocket" ? "#00ffff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          ROCKET
        </Text>
      </group>

      {/* Astronaut model - right side */}
      <group
        ref={astronautRef}
        position={[1.5, -1, 0]}
        onClick={() => onSelectVehicle("astronaut")}
        onPointerEnter={() => setHoveredOption("astronaut")}
        onPointerLeave={() => setHoveredOption(null)}
      >
        {/* Helmet */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={hoveredOption === "astronaut" ? "#66ccff" : "#ffffff"}
            emissive={hoveredOption === "astronaut" ? "#66ccff" : "#000000"}
            emissiveIntensity={hoveredOption === "astronaut" ? 0.3 : 0}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0.7, 0.15]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#1a1a3a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Body/suit */}
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
          <meshStandardMaterial
            color={hoveredOption === "astronaut" ? "#4488cc" : "#e8e8e8"}
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0.2, -0.2]}>
          <boxGeometry args={[0.25, 0.35, 0.1]} />
          <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.3, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        <mesh position={[0.3, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.1, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.3, 8, 8]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        <mesh position={[0.1, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.3, 8, 8]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>

        {/* Label */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color={hoveredOption === "astronaut" ? "#00ffff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          ASTRONAUT
        </Text>
      </group>

      {/* Selection hint */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.12}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Choose your exit method
      </Text>
    </group>
  );
};

export default ExitOptions;
