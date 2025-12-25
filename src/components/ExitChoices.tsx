import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Galaxy preview in the window (simplified version)
const GalaxyPreview = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const planetsRef = useRef<THREE.Group>(null);

  const planets = useMemo(() => [
    { radius: 8, size: 0.8, color: "#ff7755", speed: 0.3, angle: 0 },
    { radius: 12, size: 1.1, color: "#55aaff", speed: 0.2, angle: Math.PI * 0.5 },
    { radius: 17, size: 0.9, color: "#66ff88", speed: 0.25, angle: Math.PI },
    { radius: 23, size: 1.8, color: "#ffbb55", speed: 0.1, angle: Math.PI * 1.3 },
    { radius: 30, size: 1.5, color: "#bb77ff", speed: 0.08, angle: Math.PI * 0.7 },
  ], []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }

    if (planetsRef.current) {
      planetsRef.current.children.forEach((planet, i) => {
        const data = planets[i];
        const angle = data.angle + time * data.speed;
        planet.position.x = Math.cos(angle) * data.radius;
        planet.position.z = Math.sin(angle) * data.radius;
      });
    }
  });

  return (
    <group position={[0, 0, -80]} scale={0.6}>
      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.4} />
      </mesh>
      <pointLight color="#ffdd44" intensity={3} distance={100} />

      {/* Planets */}
      <group ref={planetsRef}>
        {planets.map((planet, i) => (
          <mesh key={i} position={[planet.radius, 0, 0]}>
            <sphereGeometry args={[planet.size, 16, 16]} />
            <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>

      {/* Orbit rings */}
      {planets.map((planet, i) => (
        <mesh key={`orbit-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.radius - 0.05, planet.radius + 0.05, 64]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// Space Station Interior
const SpaceStationInterior = () => {
  const stationRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Subtle station sway
    if (stationRef.current) {
      stationRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.01;
      stationRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.005;
    }
  });

  return (
    <group ref={stationRef}>
      {/* Floor */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Floor grid lines */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <mesh key={`grid-x-${i}`} position={[x, -3.49, 0]}>
          <boxGeometry args={[0.02, 0.01, 20]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      ))}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <mesh key={`grid-z-${i}`} position={[0, -3.49, z]}>
          <boxGeometry args={[25, 0.01, 0.02]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Ceiling lights */}
      {[-6, 0, 6].map((x, i) => (
        <group key={`light-${i}`} position={[x, 5.8, 0]}>
          <mesh>
            <boxGeometry args={[2, 0.1, 8]} />
            <meshBasicMaterial color="#88ccff" transparent opacity={0.8} />
          </mesh>
          <pointLight color="#88ccff" intensity={0.5} distance={8} />
        </group>
      ))}

      {/* Left wall */}
      <mesh position={[-12, 1.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 9.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Right wall */}
      <mesh position={[12, 1.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 9.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Back wall with large window */}
      <mesh position={[0, 1.25, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[24, 9.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Large hexagonal window frame */}
      <group position={[0, 2, -9.9]}>
        {/* Window frame - outer */}
        <mesh>
          <ringGeometry args={[6, 7, 6]} />
          <meshStandardMaterial color="#334455" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Window frame - inner glow */}
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[5.8, 6.2, 6]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.3} />
        </mesh>
        {/* Window glass effect */}
        <mesh position={[0, 0, -0.1]}>
          <circleGeometry args={[6, 6]} />
          <meshPhysicalMaterial 
            color="#001122" 
            transparent 
            opacity={0.2}
            metalness={0.1}
            roughness={0}
            transmission={0.9}
          />
        </mesh>
      </group>

      {/* Side accent lights */}
      {[-11, 11].map((x, i) => (
        <group key={`accent-${i}`}>
          <mesh position={[x, 0, -5]}>
            <boxGeometry args={[0.1, 6, 0.1]} />
            <meshBasicMaterial color="#ff4466" />
          </mesh>
          <mesh position={[x, 0, 5]}>
            <boxGeometry args={[0.1, 6, 0.1]} />
            <meshBasicMaterial color="#44ff66" />
          </mesh>
          <pointLight position={[x, 0, -5]} color="#ff4466" intensity={0.3} distance={5} />
          <pointLight position={[x, 0, 5]} color="#44ff66" intensity={0.3} distance={5} />
        </group>
      ))}

      {/* Control panels on sides */}
      {[-10, 10].map((x, i) => (
        <group key={`panel-${i}`} position={[x, 0, 0]} rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[3, 2, 0.2]} />
            <meshStandardMaterial color="#222233" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0.2, 0.22]}>
            <boxGeometry args={[2.5, 1.2, 0.02]} />
            <meshBasicMaterial color="#003344" />
          </mesh>
          {/* Buttons */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((bx, bi) => (
            <mesh key={bi} position={[bx, -0.7, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
              <meshBasicMaterial color={["#ff0000", "#00ff00", "#0088ff", "#ffaa00", "#ff00ff"][bi]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Front opening (where player will exit) */}
      <mesh position={[0, 1.25, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[24, 9.5]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Warning stripes near vehicles */}
      {[-4, 4].map((x, i) => (
        <mesh key={`stripe-${i}`} position={[x, -3.48, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 4]} />
          <meshBasicMaterial color={i === 0 ? "#ff6600" : "#00aaff"} transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
};

const ExitChoices = ({ onSelect }: ExitChoicesProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          <pointLight position={[0, 3, 0]} intensity={0.4} color="#4fc3f7" />
          
          {/* Stars visible through window */}
          <Stars radius={200} depth={100} count={3000} factor={4} saturation={0} fade speed={0.5} />
          
          {/* Galaxy visible through window */}
          <GalaxyPreview />
          
          {/* Space station interior */}
          <SpaceStationInterior />

          {/* Vehicle models inside station */}
          <group position={[0, 0.5, 2]}>
            <ExitModels onSelect={onSelect} hovered={hovered} setHovered={setHovered} />
          </group>
        </Suspense>
      </Canvas>

      {/* Title overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="bg-background/60 backdrop-blur-md rounded-lg px-8 py-4 border border-cyan-500/30">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">
            <span className="text-cyan-400">Launch</span> Bay
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Select your vehicle to explore the galaxy</p>
        </div>
      </div>

      {/* Hover hint */}
      {hovered && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
            <p className="text-foreground text-lg font-semibold">
              {hovered === "rocket" ? "🚀 Rocket - Fast & Powerful" : "🧑‍🚀 Astronaut - Free & Agile"}
            </p>
            <p className="text-muted-foreground text-sm">Click to launch</p>
          </div>
        </div>
      )}

      {/* Station UI elements */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-background/40 backdrop-blur-sm rounded px-3 py-2 border border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-mono">SYSTEMS ONLINE</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-background/40 backdrop-blur-sm rounded px-3 py-2 border border-cyan-500/30">
          <span className="text-cyan-400 text-xs font-mono">DOCKING BAY 01</span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="flex justify-between items-center">
          <div className="bg-background/40 backdrop-blur-sm rounded px-3 py-1 border border-orange-500/30">
            <span className="text-orange-400 text-xs font-mono">◀ ROCKET BAY</span>
          </div>
          <div className="bg-background/40 backdrop-blur-sm rounded px-3 py-1 border border-blue-500/30">
            <span className="text-blue-400 text-xs font-mono">ASTRONAUT BAY ▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitChoices;