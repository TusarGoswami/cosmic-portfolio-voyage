import { Suspense, useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

interface GalaxyExplorationProps {
  vehicle: "rocket" | "astronaut";
}

interface PlanetData {
  id: number;
  name: string;
  orbitRadius: number;
  size: number;
  color: string;
  orbitSpeed: number;
  rotationSpeed: number;
  spotColor: string;
  glowColor: string;
  hasRing?: boolean;
  ringColor?: string;
  hasSatellite?: boolean;
  initialAngle: number;
  description: string;
  facts: string[];
  moons: number;
}

const PLANETS_DATA: PlanetData[] = [
  { 
    id: 0, name: "Pyralis", orbitRadius: 22, size: 2, color: "#ff7755", orbitSpeed: 0.25, rotationSpeed: 1.8, 
    spotColor: "#ffaa88", glowColor: "#ff9966", hasSatellite: true, initialAngle: 0,
    description: "A volcanic world with rivers of molten lava and intense heat.",
    facts: ["Orbital period: 88 days", "Surface temp: 450°C", "Volcanic activity: Extreme"],
    moons: 1
  },
  { 
    id: 1, name: "Aquaris", orbitRadius: 32, size: 2.8, color: "#55aaff", orbitSpeed: 0.18, rotationSpeed: 1.4, 
    spotColor: "#88ccff", glowColor: "#77bbff", hasRing: true, ringColor: "#8899bb", initialAngle: Math.PI * 0.5,
    description: "An ocean world with crystalline ice rings and deep underwater cities.",
    facts: ["Orbital period: 210 days", "97% water surface", "Ring composition: Ice crystals"],
    moons: 3
  },
  { 
    id: 2, name: "Verdania", orbitRadius: 44, size: 2.5, color: "#66ff88", orbitSpeed: 0.22, rotationSpeed: 2.5, 
    spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI,
    description: "A lush paradise planet covered in bioluminescent forests.",
    facts: ["Orbital period: 365 days", "85% forest coverage", "Biodiversity: Extreme"],
    moons: 2
  },
  { 
    id: 3, name: "Solarius", orbitRadius: 58, size: 5, color: "#ffbb55", orbitSpeed: 0.08, rotationSpeed: 0.6, 
    spotColor: "#ffdd88", glowColor: "#ffcc66", hasRing: true, ringColor: "#ddaa66", hasSatellite: true, initialAngle: Math.PI * 1.3,
    description: "The golden giant with massive storms and floating cloud cities.",
    facts: ["Orbital period: 12 years", "Great Storm: 400 years old", "Atmosphere: Metallic hydrogen"],
    moons: 67
  },
  { 
    id: 4, name: "Nebulora", orbitRadius: 75, size: 4, color: "#bb77ff", orbitSpeed: 0.06, rotationSpeed: 0.8, 
    spotColor: "#dd99ff", glowColor: "#cc88ff", hasSatellite: true, initialAngle: Math.PI * 0.7,
    description: "A mystical purple world surrounded by cosmic dust clouds.",
    facts: ["Orbital period: 30 years", "Nebula density: High", "Magnetic field: Extreme"],
    moons: 24
  },
  { 
    id: 5, name: "Rosaria", orbitRadius: 92, size: 2.2, color: "#ff77aa", orbitSpeed: 0.12, rotationSpeed: 1.5, 
    spotColor: "#ff99cc", glowColor: "#ff88bb", initialAngle: Math.PI * 1.8,
    description: "The rose planet known for its crystalline pink deserts.",
    facts: ["Orbital period: 15 years", "Crystal formations: Abundant", "Surface: Silicon dioxide"],
    moons: 0
  },
  { 
    id: 6, name: "Cryonia", orbitRadius: 110, size: 4.5, color: "#77ffff", orbitSpeed: 0.04, rotationSpeed: 0.5, 
    spotColor: "#99ffff", glowColor: "#88ffff", hasRing: true, ringColor: "#66cccc", hasSatellite: true, initialAngle: Math.PI * 0.3,
    description: "An ice giant at the edge of the system with aurora displays.",
    facts: ["Orbital period: 84 years", "Surface temp: -224°C", "Aurora frequency: Constant"],
    moons: 42
  },
];

// Blinking Stars Background
const BlinkingStars = ({ count = 4000 }: { count?: number }) => {
  const starsRef = useRef<THREE.Points>(null);
  
  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const starColors = [
      [1, 1, 1],
      [1, 0.9, 0.8],
      [0.8, 0.9, 1],
      [1, 0.8, 0.6],
      [0.9, 0.95, 1],
    ];
    
    for (let i = 0; i < count; i++) {
      const radius = 150 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 3 + 1;
      phases[i] = Math.random() * Math.PI * 2;
      
      const colorIdx = Math.floor(Math.random() * starColors.length);
      colors[i * 3] = starColors[colorIdx][0];
      colors[i * 3 + 1] = starColors[colorIdx][1];
      colors[i * 3 + 2] = starColors[colorIdx][2];
    }
    
    return { positions, sizes, phases, colors };
  }, [count]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      const sizesAttr = starsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        const blink = Math.sin(time * (0.5 + (i % 10) * 0.1) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.4 + blink * 0.6);
      }
      sizesAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(1 + Math.sin(time * 2 + 1) * 0.05);
      glow2Ref.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>
      
      <mesh ref={glowRef}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>
      
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[10.5, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[13, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.08} />
      </mesh>
      
      <pointLight color="#ffdd44" intensity={5} distance={200} />
      <pointLight color="#ff8800" intensity={2} distance={100} />
    </group>
  );
};

// Orbital Path
const OrbitalPath = ({ radius, color = "#ffffff" }: { radius: number; color?: string }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.25}
    />
  );
};

// Satellite orbiting a planet
const Satellite = ({ orbitRadius, speed, size = 0.3 }: { orbitRadius: number; speed: number; size?: number }) => {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime * speed;
      satelliteRef.current.position.x = Math.cos(time) * orbitRadius;
      satelliteRef.current.position.z = Math.sin(time) * orbitRadius;
      satelliteRef.current.position.y = Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      <pointLight color="#ffffff" intensity={0.5} distance={4} />
    </group>
  );
};

// Interactive Planet Component
interface PlanetProps {
  planet: PlanetData;
  onSelect: (planet: PlanetData) => void;
  isSelected: boolean;
}

const Planet = ({ planet, onSelect, isSelected }: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currentPosition = useRef(new THREE.Vector3());

  const spotTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(0.3, planet.spotColor || planet.color);
      gradient.addColorStop(0.7, planet.color);
      gradient.addColorStop(1, planet.spotColor || planet.color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      ctx.fillStyle = planet.spotColor || "rgba(255,255,255,0.25)";
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 15;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 8;
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 40 + Math.random() * 15;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + 10, 384, y - 10, 512, y);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [planet.color, planet.spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      const angle = planet.initialAngle + time * planet.orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 2) * 1;
      currentPosition.current.copy(groupRef.current.position);
    }
    
    if (planetRef.current) {
      planetRef.current.rotation.y = time * planet.rotationSpeed;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * planet.rotationSpeed * 0.5;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(planet);
  };

  return (
    <group ref={groupRef}>
      {/* Planet body */}
      <mesh 
        ref={planetRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered || isSelected ? 1.15 : 1}
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial 
          map={spotTexture}
          emissive={planet.color}
          emissiveIntensity={hovered || isSelected ? 0.4 : 0.15}
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>
      
      {/* Inner atmosphere */}
      <mesh ref={atmosphereRef} scale={hovered || isSelected ? 1.15 : 1}>
        <sphereGeometry args={[planet.size * 1.05, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={hovered || isSelected ? 0.4 : 0.2} />
      </mesh>
      
      {/* Outer atmosphere glow */}
      <mesh scale={hovered || isSelected ? 1.15 : 1}>
        <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={hovered || isSelected ? 0.25 : 0.1} />
      </mesh>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.8, planet.size * 2, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Ring */}
      {planet.hasRing && (
        <>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 1.5, planet.size * 2.2, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 2.2, planet.size * 2.5, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      
      {/* Satellite */}
      {planet.hasSatellite && (
        <Satellite orbitRadius={planet.size * 2.5} speed={1.5} size={planet.size * 0.2} />
      )}
      
      {/* Hover label */}
      {hovered && !isSelected && (
        <Html distanceFactor={15} center>
          <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30 whitespace-nowrap pointer-events-none">
            <span className="text-foreground text-sm font-medium">{planet.name}</span>
          </div>
        </Html>
      )}
      
      <pointLight color={planet.color} intensity={0.3} distance={planet.size * 5} />
    </group>
  );
};

// Space Station
const SpaceStation = ({ position }: { position: [number, number, number] }) => {
  const stationRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stationRef.current) {
      stationRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={stationRef} position={position} scale={2}>
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.6, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.35, 12, 48]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh 
          key={i} 
          position={[Math.cos(angle * Math.PI / 180) * 1.5, 0, Math.sin(angle * Math.PI / 180) * 1.5]}
          rotation={[0, -angle * Math.PI / 180, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
          <meshStandardMaterial color="#777777" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      
      <mesh position={[5, 0, 0]}>
        <boxGeometry args={[3, 0.08, 1.2]} />
        <meshStandardMaterial color="#1a4a7c" metalness={0.4} roughness={0.6} emissive="#112244" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-5, 0, 0]}>
        <boxGeometry args={[3, 0.08, 1.2]} />
        <meshStandardMaterial color="#1a4a7c" metalness={0.4} roughness={0.6} emissive="#112244" emissiveIntensity={0.3} />
      </mesh>
      
      <pointLight color="#00ff88" intensity={1} distance={8} position={[0, 0.5, 0]} />
      <pointLight color="#ff4444" intensity={0.5} distance={5} position={[3, 0, 0]} />
      <pointLight color="#4444ff" intensity={0.5} distance={5} position={[-3, 0, 0]} />
    </group>
  );
};

// Camera Controller for zoom
interface CameraControllerProps {
  selectedPlanet: PlanetData | null;
  controlsRef: React.RefObject<any>;
}

const CameraController = ({ selectedPlanet, controlsRef }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(50, 60, 120));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (selectedPlanet) {
      // Calculate planet position
      const angle = selectedPlanet.initialAngle + time * selectedPlanet.orbitSpeed;
      const planetX = Math.cos(angle) * selectedPlanet.orbitRadius;
      const planetZ = Math.sin(angle) * selectedPlanet.orbitRadius;
      const planetY = Math.sin(angle * 2) * 1;
      
      // Set target to zoom to planet
      const distance = selectedPlanet.size * 6;
      targetPosition.current.set(
        planetX + distance,
        planetY + distance * 0.5,
        planetZ + distance
      );
      targetLookAt.current.set(planetX, planetY, planetZ);
    } else {
      // Default overview position
      targetPosition.current.set(50, 60, 120);
      targetLookAt.current.set(0, 0, 0);
    }
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.02);
    
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.02);
    }
  });

  return null;
};

// Main Galaxy Scene
interface GalaxySceneProps {
  selectedPlanet: PlanetData | null;
  onPlanetSelect: (planet: PlanetData) => void;
}

const GalaxyScene = ({ selectedPlanet, onPlanetSelect }: GalaxySceneProps) => {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[30, 30, 15]} intensity={0.4} />
      
      <BlinkingStars count={5000} />
      
      <GalaxyCore />
      
      {/* Orbital paths */}
      {PLANETS_DATA.map((planet) => (
        <OrbitalPath key={`orbit-${planet.id}`} radius={planet.orbitRadius} color={planet.color} />
      ))}
      
      {/* Planets */}
      {PLANETS_DATA.map((planet) => (
        <Planet 
          key={`planet-${planet.id}`} 
          planet={planet} 
          onSelect={onPlanetSelect}
          isSelected={selectedPlanet?.id === planet.id}
        />
      ))}
      
      {/* Space Station */}
      <SpaceStation position={[70, 15, -50]} />
      
      {/* Camera controller */}
      <CameraController selectedPlanet={selectedPlanet} controlsRef={controlsRef} />
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={15}
        maxDistance={250}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      {/* Nebula fog */}
      <fog attach="fog" args={["#050510", 120, 400]} />
    </>
  );
};

// Planet Detail Panel
interface PlanetDetailProps {
  planet: PlanetData;
  onClose: () => void;
}

const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="absolute top-6 right-6 w-80 bg-card/95 backdrop-blur-md rounded-2xl border border-border/30 overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div
        className="p-6 relative"
        style={{
          background: `linear-gradient(135deg, ${planet.color}33, transparent)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <span className="text-foreground text-lg">×</span>
        </button>
        
        <div
          className="w-16 h-16 rounded-full mb-4 shadow-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}88)`,
            boxShadow: `0 0 30px ${planet.color}66`,
          }}
        />
        
        <h2 className="text-2xl font-bold text-foreground">{planet.name}</h2>
        <p className="text-muted-foreground text-sm mt-1">{planet.description}</p>
      </div>
      
      {/* Stats */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-muted-foreground text-xs uppercase tracking-wider">Size</div>
            <div className="text-foreground font-semibold">{planet.size.toFixed(1)}x Earth</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-muted-foreground text-xs uppercase tracking-wider">Moons</div>
            <div className="text-foreground font-semibold">{planet.moons}</div>
          </div>
        </div>
        
        {/* Facts */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Facts</h3>
          <ul className="space-y-2">
            {planet.facts.map((fact, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <span className="text-muted-foreground text-sm">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {planet.hasRing && (
            <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent border border-accent/30">
              Has Rings
            </span>
          )}
          {planet.moons > 10 && (
            <span className="px-2 py-1 text-xs rounded-full bg-space-glow/20 text-[hsl(var(--space-glow))] border border-space-glow/30">
              Many Moons
            </span>
          )}
          {planet.hasSatellite && (
            <span className="px-2 py-1 text-xs rounded-full bg-space-star/20 text-[hsl(var(--space-star))] border border-space-star/30">
              Satellite
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Planet Selection HUD
interface HUDProps {
  onPlanetSelect: (planet: PlanetData) => void;
  selectedPlanet: PlanetData | null;
}

const PlanetHUD = ({ onPlanetSelect, selectedPlanet }: HUDProps) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-card/80 backdrop-blur-md rounded-full px-5 py-3 border border-border/30">
      {PLANETS_DATA.map((planet) => (
        <button
          key={planet.id}
          onClick={() => onPlanetSelect(planet)}
          className={`w-9 h-9 rounded-full transition-all duration-300 ${
            selectedPlanet?.id === planet.id
              ? "ring-2 ring-foreground scale-110"
              : "hover:scale-110 opacity-70 hover:opacity-100"
          }`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}88)`,
            boxShadow: selectedPlanet?.id === planet.id ? `0 0 15px ${planet.color}` : "none",
          }}
          title={planet.name}
        />
      ))}
    </div>
  );
};

const GalaxyExploration = ({ vehicle }: GalaxyExplorationProps) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const handlePlanetSelect = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPlanet(null);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d25] to-[#050515]">
      <Canvas 
        camera={{ position: [50, 60, 120], fov: 55 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <GalaxyScene 
            selectedPlanet={selectedPlanet}
            onPlanetSelect={handlePlanetSelect}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-5 py-4 border border-accent/30 shadow-lg shadow-accent/10">
          <h2 className="text-foreground text-2xl font-bold mb-1 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Galaxy Explorer</h2>
          <p className="text-muted-foreground text-sm">
            {vehicle === "rocket" ? "🚀" : "🧑‍🚀"} Viewing as {vehicle === "rocket" ? "Rocket" : "Astronaut"}
          </p>
        </div>
      </div>

      {/* Planet count */}
      {!selectedPlanet && (
        <div className="absolute top-6 right-6 pointer-events-none">
          <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-5 py-3 border border-accent/30 shadow-lg shadow-accent/10">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Planets</p>
            <p className="text-foreground text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">7</p>
          </div>
        </div>
      )}

      {/* Planet Selection HUD */}
      <PlanetHUD onPlanetSelect={handlePlanetSelect} selectedPlanet={selectedPlanet} />

      {/* Planet Detail Panel */}
      <AnimatePresence>
        {selectedPlanet && (
          <PlanetDetail planet={selectedPlanet} onClose={handleClose} />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-gradient-to-r from-background/70 via-background/80 to-background/70 backdrop-blur-md rounded-full px-8 py-3 border border-border/30 shadow-lg">
          <p className="text-muted-foreground text-sm text-center">
            🖱️ Click planets to explore • Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalaxyExploration;
