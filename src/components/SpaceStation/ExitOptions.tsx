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
  const rocketGlowRef = useRef<THREE.Mesh>(null);
  const astronautGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rocket animations
    if (rocketRef.current) {
      const targetScale = hoveredOption === "rocket" ? 1.3 : 1;
      rocketRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      rocketRef.current.position.y = -1 + Math.sin(time * 2) * 0.15;
      rocketRef.current.rotation.y = time * 0.5;
    }
    
    // Astronaut animations
    if (astronautRef.current) {
      const targetScale = hoveredOption === "astronaut" ? 1.3 : 1;
      astronautRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      astronautRef.current.position.y = -1 + Math.sin(time * 2 + 1) * 0.15;
      astronautRef.current.rotation.y = Math.sin(time * 0.5) * 0.4;
    }

    // Glow ring animations
    if (rocketGlowRef.current) {
      const mat = rocketGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hoveredOption === "rocket" 
        ? 0.8 + Math.sin(time * 4) * 0.2 
        : 0.3;
      rocketGlowRef.current.rotation.z = time * 2;
    }
    if (astronautGlowRef.current) {
      const mat = astronautGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hoveredOption === "astronaut" 
        ? 0.8 + Math.sin(time * 4) * 0.2 
        : 0.3;
      astronautGlowRef.current.rotation.z = -time * 2;
    }
  });

  return (
    <group position={position}>
      {/* EXIT sign with animated glow */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <boxGeometry args={[2.5, 0.6, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.35}
          color="#ff3333"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          🚀 EXIT 🧑‍🚀
        </Text>
      </group>

      {/* Main platform with glow */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Platform glow ring */}
      <mesh position={[0, -2.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.5, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
      </mesh>

      {/* Rocket selection area */}
      <group
        ref={rocketRef}
        position={[-1.5, -1, 0]}
        onClick={() => onSelectVehicle("rocket")}
        onPointerEnter={() => {
          setHoveredOption("rocket");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHoveredOption(null);
          document.body.style.cursor = "default";
        }}
      >
        {/* Hover glow ring under rocket */}
        <mesh 
          ref={rocketGlowRef}
          position={[0, -1.3, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.8, 6]} />
          <meshBasicMaterial 
            color="#ff6600" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Rocket body - main cylinder */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 1.2, 16]} />
          <meshStandardMaterial
            color={hoveredOption === "rocket" ? "#ff8844" : "#e0e0e0"}
            emissive={hoveredOption === "rocket" ? "#ff6600" : "#000000"}
            emissiveIntensity={hoveredOption === "rocket" ? 0.6 : 0}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        
        {/* Rocket stripes */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.1, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.1, 16]} />
          <meshStandardMaterial color="#3366ff" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Rocket nose cone */}
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.18, 0.5, 16]} />
          <meshStandardMaterial 
            color="#ff3333" 
            metalness={0.8} 
            roughness={0.2}
            emissive={hoveredOption === "rocket" ? "#ff0000" : "#000000"}
            emissiveIntensity={hoveredOption === "rocket" ? 0.3 : 0}
          />
        </mesh>

        {/* Rocket window */}
        <mesh position={[0, 0.7, 0.17]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial 
            color="#66ccff" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#66ccff"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Rocket fins - 4 fins */}
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.28,
              -0.1,
              Math.sin((angle * Math.PI) / 180) * 0.28,
            ]}
            rotation={[0, (-angle * Math.PI) / 180, 0.2]}
          >
            <boxGeometry args={[0.15, 0.35, 0.03]} />
            <meshStandardMaterial 
              color={hoveredOption === "rocket" ? "#ff6644" : "#3366cc"} 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Rocket engine nozzle */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.15, 0.22, 0.2, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Engine flame effect */}
        <mesh position={[0, -0.45, 0]}>
          <coneGeometry args={[0.15, 0.4, 16]} />
          <meshBasicMaterial 
            color={hoveredOption === "rocket" ? "#ffaa00" : "#ff6600"} 
            transparent 
            opacity={hoveredOption === "rocket" ? 0.9 : 0.6}
          />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.08, 0.3, 16]} />
          <meshBasicMaterial color="#ffff66" transparent opacity={0.8} />
        </mesh>

        {/* Rocket engine glow */}
        <pointLight 
          position={[0, -0.3, 0]} 
          color="#ff6600" 
          intensity={hoveredOption === "rocket" ? 3 : 1} 
          distance={3} 
        />

        {/* Label with glow effect */}
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.18}
          color={hoveredOption === "rocket" ? "#ffaa00" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={hoveredOption === "rocket" ? 0.02 : 0}
          outlineColor="#ff6600"
        >
          🚀 ROCKET
        </Text>
        <Text
          position={[0, -1.35, 0]}
          fontSize={0.1}
          color={hoveredOption === "rocket" ? "#ff6600" : "#888888"}
          anchorX="center"
          anchorY="middle"
        >
          Fast & Powerful
        </Text>
      </group>

      {/* Astronaut selection area */}
      <group
        ref={astronautRef}
        position={[1.5, -1, 0]}
        onClick={() => onSelectVehicle("astronaut")}
        onPointerEnter={() => {
          setHoveredOption("astronaut");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHoveredOption(null);
          document.body.style.cursor = "default";
        }}
      >
        {/* Hover glow ring under astronaut */}
        <mesh 
          ref={astronautGlowRef}
          position={[0, -1.3, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.8, 8]} />
          <meshBasicMaterial 
            color="#66ccff" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Helmet */}
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={hoveredOption === "astronaut" ? "#88ddff" : "#ffffff"}
            emissive={hoveredOption === "astronaut" ? "#44aaff" : "#000000"}
            emissiveIntensity={hoveredOption === "astronaut" ? 0.4 : 0}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        
        {/* Helmet gold visor */}
        <mesh position={[0, 0.75, 0.2]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            metalness={1} 
            roughness={0.05}
            emissive={hoveredOption === "astronaut" ? "#ff8800" : "#664400"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Helmet rim */}
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.28, 0.04, 8, 32]} />
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Body/suit */}
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
          <meshStandardMaterial
            color={hoveredOption === "astronaut" ? "#aaddff" : "#f0f0f0"}
            emissive={hoveredOption === "astronaut" ? "#4488cc" : "#000000"}
            emissiveIntensity={hoveredOption === "astronaut" ? 0.2 : 0}
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>

        {/* Chest panel */}
        <mesh position={[0, 0.2, 0.22]}>
          <boxGeometry args={[0.2, 0.25, 0.05]} />
          <meshStandardMaterial 
            color="#333333" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        {/* Panel lights */}
        <mesh position={[-0.05, 0.25, 0.25]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={hoveredOption === "astronaut" ? "#00ff00" : "#004400"} />
        </mesh>
        <mesh position={[0.05, 0.25, 0.25]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={hoveredOption === "astronaut" ? "#ff0000" : "#440000"} />
        </mesh>

        {/* Backpack (life support) */}
        <mesh position={[0, 0.2, -0.25]}>
          <boxGeometry args={[0.35, 0.45, 0.15]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Backpack details */}
        <mesh position={[0, 0.35, -0.33]}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Arms with joints */}
        <group position={[-0.35, 0.2, 0]}>
          <mesh rotation={[0, 0, Math.PI / 5]}>
            <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Glove */}
          <mesh position={[-0.2, -0.15, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color={hoveredOption === "astronaut" ? "#ffaa00" : "#ff6600"} 
              metalness={0.5} 
              roughness={0.4} 
            />
          </mesh>
        </group>
        <group position={[0.35, 0.2, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 5]}>
            <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Glove */}
          <mesh position={[0.2, -0.15, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color={hoveredOption === "astronaut" ? "#ffaa00" : "#ff6600"} 
              metalness={0.5} 
              roughness={0.4} 
            />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.12, -0.35, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0.12, -0.35, 0]}>
          <capsuleGeometry args={[0.09, 0.35, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* Boots */}
        <mesh position={[-0.12, -0.7, 0.03]}>
          <boxGeometry args={[0.12, 0.12, 0.2]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.12, -0.7, 0.03]}>
          <boxGeometry args={[0.12, 0.12, 0.2]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Astronaut glow */}
        <pointLight 
          position={[0, 0.5, 0.5]} 
          color="#66ccff" 
          intensity={hoveredOption === "astronaut" ? 2 : 0.5} 
          distance={3} 
        />

        {/* Label with glow effect */}
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.18}
          color={hoveredOption === "astronaut" ? "#66ddff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={hoveredOption === "astronaut" ? 0.02 : 0}
          outlineColor="#44aaff"
        >
          🧑‍🚀 ASTRONAUT
        </Text>
        <Text
          position={[0, -1.35, 0]}
          fontSize={0.1}
          color={hoveredOption === "astronaut" ? "#66ccff" : "#888888"}
          anchorX="center"
          anchorY="middle"
        >
          Free & Agile
        </Text>
      </group>

      {/* Selection hint */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.14}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        Choose your exit method
      </Text>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.1}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        Click to select
      </Text>
    </group>
  );
};

export default ExitOptions;
