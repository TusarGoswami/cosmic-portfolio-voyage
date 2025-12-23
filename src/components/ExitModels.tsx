import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ExitModelsProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}

const ExitModels = ({ onSelect, hovered, setHovered }: ExitModelsProps) => {
  const rocketRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (rocketRef.current) {
      const targetScale = hovered === "rocket" ? 1.2 : 1;
      rocketRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      rocketRef.current.position.y = Math.sin(time * 1.5) * 0.2;
      rocketRef.current.rotation.y = time * 0.3;
    }
    
    if (astronautRef.current) {
      const targetScale = hovered === "astronaut" ? 1.2 : 1;
      astronautRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      astronautRef.current.position.y = Math.sin(time * 1.5 + 1) * 0.2;
      astronautRef.current.rotation.y = Math.sin(time * 0.5) * 0.3;
    }
  });

  return (
    <group>
      {/* Platform */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 6, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </mesh>

      {/* Rocket */}
      <group
        ref={rocketRef}
        position={[-2.5, 0, 0]}
        onClick={() => onSelect("rocket")}
        onPointerEnter={() => {
          setHovered("rocket");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(null);
          document.body.style.cursor = "default";
        }}
      >
        {/* Glow ring */}
        <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 6]} />
          <meshBasicMaterial 
            color="#ff6600" 
            transparent 
            opacity={hovered === "rocket" ? 0.8 : 0.3}
          />
        </mesh>

        {/* Rocket body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.35, 0.5, 2, 16]} />
          <meshStandardMaterial
            color={hovered === "rocket" ? "#ff8844" : "#e0e0e0"}
            emissive={hovered === "rocket" ? "#ff6600" : "#000000"}
            emissiveIntensity={hovered === "rocket" ? 0.5 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Stripes */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.15, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.15, 16]} />
          <meshStandardMaterial color="#3366ff" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Nose cone */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[0.35, 0.8, 16]} />
          <meshStandardMaterial 
            color="#ff3333" 
            metalness={0.8} 
            roughness={0.2}
            emissive={hovered === "rocket" ? "#ff0000" : "#000000"}
            emissiveIntensity={hovered === "rocket" ? 0.3 : 0}
          />
        </mesh>

        {/* Window */}
        <mesh position={[0, 0.9, 0.33]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial 
            color="#66ccff" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#66ccff"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Fins */}
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.5,
              -0.3,
              Math.sin((angle * Math.PI) / 180) * 0.5,
            ]}
            rotation={[0, (-angle * Math.PI) / 180, 0.2]}
          >
            <boxGeometry args={[0.25, 0.5, 0.05]} />
            <meshStandardMaterial 
              color={hovered === "rocket" ? "#ff6644" : "#3366cc"} 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Engine nozzle */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.25, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Flame */}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[0.25, 0.6, 16]} />
          <meshBasicMaterial color={hovered === "rocket" ? "#ffaa00" : "#ff6600"} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -1.15, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshBasicMaterial color="#ffff66" transparent opacity={0.9} />
        </mesh>

        <pointLight position={[0, -0.5, 0]} color="#ff6600" intensity={hovered === "rocket" ? 4 : 2} distance={5} />
      </group>

      {/* Astronaut */}
      <group
        ref={astronautRef}
        position={[2.5, 0, 0]}
        onClick={() => onSelect("astronaut")}
        onPointerEnter={() => {
          setHovered("astronaut");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(null);
          document.body.style.cursor = "default";
        }}
      >
        {/* Glow ring */}
        <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 8]} />
          <meshBasicMaterial 
            color="#66ccff" 
            transparent 
            opacity={hovered === "astronaut" ? 0.8 : 0.3}
          />
        </mesh>

        {/* Helmet */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={hovered === "astronaut" ? "#88ddff" : "#ffffff"}
            emissive={hovered === "astronaut" ? "#44aaff" : "#000000"}
            emissiveIntensity={hovered === "astronaut" ? 0.4 : 0}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        
        {/* Gold visor */}
        <mesh position={[0, 1.2, 0.35]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            metalness={1} 
            roughness={0.05}
            emissive={hovered === "astronaut" ? "#ff8800" : "#664400"}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Helmet rim */}
        <mesh position={[0, 0.8, 0]}>
          <torusGeometry args={[0.45, 0.06, 8, 32]} />
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.4, 0.6, 8, 16]} />
          <meshStandardMaterial
            color={hovered === "astronaut" ? "#aaddff" : "#f0f0f0"}
            emissive={hovered === "astronaut" ? "#4488cc" : "#000000"}
            emissiveIntensity={hovered === "astronaut" ? 0.2 : 0}
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>

        {/* Chest panel */}
        <mesh position={[0, 0.3, 0.38]}>
          <boxGeometry args={[0.3, 0.35, 0.08]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.08, 0.4, 0.43]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={hovered === "astronaut" ? "#00ff00" : "#004400"} />
        </mesh>
        <mesh position={[0.08, 0.4, 0.43]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={hovered === "astronaut" ? "#ff0000" : "#440000"} />
        </mesh>

        {/* Backpack */}
        <mesh position={[0, 0.25, -0.4]}>
          <boxGeometry args={[0.55, 0.7, 0.25]} />
          <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.5, -0.55]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Arms */}
        <group position={[-0.55, 0.3, 0]}>
          <mesh rotation={[0, 0, Math.PI / 5]}>
            <capsuleGeometry args={[0.12, 0.3, 8, 8]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[-0.3, -0.2, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color={hovered === "astronaut" ? "#ffaa00" : "#ff6600"} 
              metalness={0.5} 
              roughness={0.4} 
            />
          </mesh>
        </group>
        <group position={[0.55, 0.3, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 5]}>
            <capsuleGeometry args={[0.12, 0.3, 8, 8]} />
            <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0.3, -0.2, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color={hovered === "astronaut" ? "#ffaa00" : "#ff6600"} 
              metalness={0.5} 
              roughness={0.4} 
            />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.18, -0.55, 0]}>
          <capsuleGeometry args={[0.14, 0.5, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0.18, -0.55, 0]}>
          <capsuleGeometry args={[0.14, 0.5, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.6} />
        </mesh>
        
        {/* Boots */}
        <mesh position={[-0.18, -1, 0.05]}>
          <boxGeometry args={[0.18, 0.18, 0.3]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.18, -1, 0.05]}>
          <boxGeometry args={[0.18, 0.18, 0.3]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>

        <pointLight position={[0, 0.8, 0.8]} color="#66ccff" intensity={hovered === "astronaut" ? 3 : 1} distance={5} />
      </group>
    </group>
  );
};

export default ExitModels;
