import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Particles from "./Particles";

interface ExitModelsProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}

const ExitModels = ({ onSelect, hovered, setHovered }: ExitModelsProps) => {
  const rocketRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);

  // Create realistic metal textures
  const rocketBodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d4d4d4"),
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    reflectivity: 1,
  }), []);

  const rocketRedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#cc2222"),
    metalness: 0.8,
    roughness: 0.25,
    clearcoat: 0.5,
  }), []);

  const suitMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f8f8f8"),
    metalness: 0.1,
    roughness: 0.7,
    clearcoat: 0.1,
    sheen: 0.3,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#aaccff"),
  }), []);

  const visorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffaa00"),
    metalness: 1,
    roughness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    reflectivity: 1,
    envMapIntensity: 2,
  }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (rocketRef.current) {
      const targetScale = hovered === "rocket" ? 1.15 : 1;
      rocketRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      rocketRef.current.position.y = Math.sin(time * 1.2) * 0.15;
      rocketRef.current.rotation.y = time * 0.2;
    }
    
    if (astronautRef.current) {
      const targetScale = hovered === "astronaut" ? 1.15 : 1;
      astronautRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      astronautRef.current.position.y = Math.sin(time * 1.2 + 1) * 0.15;
      astronautRef.current.rotation.y = Math.sin(time * 0.4) * 0.25;
    }
  });

  return (
    <group scale={1.6}>
      {/* Platform */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.2, 8, 64]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.8, 7, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </mesh>

      {/* Rocket */}
      <group
        ref={rocketRef}
        position={[-3, 0, 0]}
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
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.5, 32]} />
          <meshBasicMaterial 
            color="#ff6600" 
            transparent 
            opacity={hovered === "rocket" ? 0.7 : 0.25}
          />
        </mesh>

        {/* Main rocket body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.7, 3, 32]} />
          <primitive object={rocketBodyMaterial} attach="material" />
        </mesh>
        
        {/* Body details - rivets/panels */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={`rivet-${i}`}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.52,
              0.8,
              Math.sin((angle * Math.PI) / 180) * 0.52,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#888888" metalness={1} roughness={0.3} />
          </mesh>
        ))}
        
        {/* Red stripe band */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.25, 32]} />
          <primitive object={rocketRedMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.2, 32]} />
          <meshStandardMaterial color="#2255aa" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Nose cone with better shape */}
        <mesh position={[0, 2.5, 0]}>
          <coneGeometry args={[0.5, 1.2, 32]} />
          <primitive object={rocketRedMaterial} attach="material" />
        </mesh>
        {/* Nose tip */}
        <mesh position={[0, 3.2, 0]}>
          <coneGeometry args={[0.12, 0.3, 16]} />
          <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.1} />
        </mesh>

        {/* Windows - multiple portholes */}
        {[0, 120, 240].map((angle, i) => (
          <group key={`window-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0, 1.3, 0.48]}>
              <circleGeometry args={[0.15, 32]} />
              <meshPhysicalMaterial 
                color="#88ddff" 
                metalness={0.3} 
                roughness={0.1}
                emissive="#44aaff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Window frame */}
            <mesh position={[0, 1.3, 0.47]}>
              <ringGeometry args={[0.15, 0.19, 32]} />
              <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Fins - more detailed */}
        {[0, 90, 180, 270].map((angle, i) => (
          <group key={`fin-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0.65, -0.5, 0]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[0.4, 0.8, 0.06]} />
              <meshStandardMaterial 
                color={hovered === "rocket" ? "#ff5533" : "#2255aa"} 
                metalness={0.85} 
                roughness={0.2}
              />
            </mesh>
            {/* Fin edge detail */}
            <mesh position={[0.85, -0.7, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Engine section */}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 0.4, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.1} />
        </mesh>
        
        {/* Engine nozzle - bell shape */}
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.35, 0.55, 0.5, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.15, 32]} />
          <meshStandardMaterial color="#ff4400" metalness={0.5} roughness={0.4} emissive="#ff2200" emissiveIntensity={0.3} />
        </mesh>

        {/* Flame - layered for realism */}
        <mesh position={[0, -1.7, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.35, 0.9, 32]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -1.85, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.7, 32]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -1.95, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.5, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
        </mesh>

        {/* Flame particles */}
        <Particles
          position={[0, -1.4, 0]}
          count={100}
          color="#ff6600"
          size={0.1}
          spread={0.35}
          speed={hovered === "rocket" ? 5 : 2.5}
          type="flame"
          active={true}
        />
        <Particles
          position={[0, -1.4, 0]}
          count={60}
          color="#ffff00"
          size={0.07}
          spread={0.2}
          speed={hovered === "rocket" ? 6 : 3}
          type="flame"
          active={true}
        />

        {hovered === "rocket" && (
          <Particles
            position={[0, -1.8, 0]}
            count={80}
            color="#ff8800"
            size={0.05}
            spread={0.5}
            speed={4}
            type="trail"
            active={true}
          />
        )}

        <pointLight position={[0, -1, 0]} color="#ff6600" intensity={hovered === "rocket" ? 5 : 2.5} distance={6} />
        <pointLight position={[0, 1, 1]} color="#ffffff" intensity={0.5} distance={3} />
      </group>

      {/* Astronaut */}
      <group
        ref={astronautRef}
        position={[3, 0, 0]}
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
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.5, 32]} />
          <meshBasicMaterial 
            color="#66ccff" 
            transparent 
            opacity={hovered === "astronaut" ? 0.7 : 0.25}
          />
        </mesh>

        {/* Helmet - larger and more detailed */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.7, 64, 64]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        
        {/* Gold visor - reflective */}
        <mesh position={[0, 1.55, 0.45]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={visorMaterial} attach="material" />
        </mesh>

        {/* Helmet rim/collar */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.6, 0.1, 16, 64]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Neck ring */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.15, 32]} />
          <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Torso - more realistic shape */}
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.55, 0.7, 16, 32]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Chest control unit */}
        <mesh position={[0, 0.35, 0.52]}>
          <boxGeometry args={[0.45, 0.5, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Control buttons/lights */}
        <mesh position={[-0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color={hovered === "astronaut" ? "#00ff00" : "#005500"} />
        </mesh>
        <mesh position={[0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color={hovered === "astronaut" ? "#ff0000" : "#550000"} />
        </mesh>
        <mesh position={[0, 0.38, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color={hovered === "astronaut" ? "#0088ff" : "#002255"} />
        </mesh>
        {/* Display screen */}
        <mesh position={[0, 0.22, 0.59]}>
          <boxGeometry args={[0.25, 0.12, 0.01]} />
          <meshBasicMaterial color="#003344" />
        </mesh>

        {/* Life support backpack - larger */}
        <mesh position={[0, 0.2, -0.55]}>
          <boxGeometry args={[0.75, 0.95, 0.35]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Backpack details */}
        <mesh position={[0, 0.55, -0.75]}>
          <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[-0.25, 0.3, -0.75]}>
          <boxGeometry args={[0.12, 0.4, 0.08]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, 0.3, -0.75]}>
          <boxGeometry args={[0.12, 0.4, 0.08]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Jetpack thrusters */}
        <mesh position={[-0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>

        {/* Jetpack flames */}
        <Particles
          position={[-0.22, -0.4, -0.65]}
          count={40}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={hovered === "astronaut" ? 3 : 1.2}
          type="flame"
          active={true}
        />
        <Particles
          position={[0.22, -0.4, -0.65]}
          count={40}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={hovered === "astronaut" ? 3 : 1.2}
          type="flame"
          active={true}
        />

        {hovered === "astronaut" && (
          <Particles
            position={[0, 0.8, 0]}
            count={60}
            color="#88ddff"
            size={0.08}
            spread={1}
            speed={1.2}
            type="sparkle"
            active={true}
          />
        )}

        {/* Arms - more detailed */}
        <group position={[-0.75, 0.35, 0]}>
          {/* Upper arm */}
          <mesh rotation={[0, 0, Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          {/* Elbow joint */}
          <mesh position={[-0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Lower arm */}
          <mesh position={[-0.4, -0.35, 0]} rotation={[0, 0, Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          {/* Glove */}
          <mesh position={[-0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color={hovered === "astronaut" ? "#ffbb00" : "#ff7700"} 
              metalness={0.4} 
              roughness={0.5} 
            />
          </mesh>
        </group>
        
        <group position={[0.75, 0.35, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.4, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color={hovered === "astronaut" ? "#ffbb00" : "#ff7700"} 
              metalness={0.4} 
              roughness={0.5} 
            />
          </mesh>
        </group>

        {/* Legs - more detailed */}
        <mesh position={[-0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        
        {/* Knee joints */}
        <mesh position={[-0.25, -0.95, 0.05]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, -0.95, 0.05]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Lower legs */}
        <mesh position={[-0.25, -1.35, 0]}>
          <capsuleGeometry args={[0.16, 0.4, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[0.25, -1.35, 0]}>
          <capsuleGeometry args={[0.16, 0.4, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        
        {/* Boots - larger and more detailed */}
        <mesh position={[-0.25, -1.75, 0.08]}>
          <boxGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#222222" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0.25, -1.75, 0.08]}>
          <boxGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#222222" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Boot soles */}
        <mesh position={[-0.25, -1.88, 0.08]}>
          <boxGeometry args={[0.28, 0.05, 0.45]} />
          <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.25, -1.88, 0.08]}>
          <boxGeometry args={[0.28, 0.05, 0.45]} />
          <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.4} />
        </mesh>

        <pointLight position={[0, 1.2, 1]} color="#66ccff" intensity={hovered === "astronaut" ? 4 : 1.5} distance={6} />
        <pointLight position={[0, 0, 1]} color="#ffffff" intensity={0.3} distance={3} />
      </group>
    </group>
  );
};

export default ExitModels;