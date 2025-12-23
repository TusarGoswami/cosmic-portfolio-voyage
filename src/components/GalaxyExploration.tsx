import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

interface GalaxyExplorationProps {
  vehicle: "rocket" | "astronaut";
}

// Blinking Stars Background
const BlinkingStars = ({ count = 2000 }: { count?: number }) => {
  const starsRef = useRef<THREE.Points>(null);
  
  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, sizes, phases };
  }, [count]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      const sizesAttr = starsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        const blink = Math.sin(time * (1 + Math.random() * 0.5) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.3 + blink * 0.7);
      }
      sizesAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Points>(null);

  const coronaParticles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.y = time * 0.05;
      coronaRef.current.rotation.x = time * 0.03;
    }
  });

  return (
    <group>
      {/* Core sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial color="#ffdd44" />
      </mesh>
      
      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>
      
      {/* Corona particles */}
      <points ref={coronaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={coronaParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#ffcc00" transparent opacity={0.6} />
      </points>
      
      {/* Sun light */}
      <pointLight color="#ffdd44" intensity={3} distance={100} />
    </group>
  );
};

// Orbital Path
const OrbitalPath = ({ radius, color = "#ffffff" }: { radius: number; color?: string }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.2}
    />
  );
};

// Satellite orbiting a planet
const Satellite = ({ 
  orbitRadius, 
  speed, 
  size = 0.1 
}: { 
  orbitRadius: number; 
  speed: number;
  size?: number;
}) => {
  const satelliteRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime * speed;
      satelliteRef.current.position.x = Math.cos(time) * orbitRadius;
      satelliteRef.current.position.z = Math.sin(time) * orbitRadius;
      satelliteRef.current.position.y = Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={satelliteRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.3} />
      <pointLight color="#ffffff" intensity={0.3} distance={2} />
    </mesh>
  );
};

// Planet with all features
const Planet = ({
  orbitRadius,
  size,
  color,
  orbitSpeed,
  rotationSpeed,
  hasRing,
  ringColor,
  hasSatellite,
  spotColor,
  initialAngle = 0,
}: {
  orbitRadius: number;
  size: number;
  color: string;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRing?: boolean;
  ringColor?: string;
  hasSatellite?: boolean;
  spotColor?: string;
  initialAngle?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  // Create spot texture for planet surface
  const spotTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Base gradient
      const gradient = ctx.createLinearGradient(0, 0, 256, 128);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, spotColor || color);
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 128);
      
      // Add spots/markings
      ctx.fillStyle = spotColor || "rgba(255,255,255,0.3)";
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 128;
        const r = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add bands
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const y = 20 + i * 25 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(64, y + 5, 192, y - 5, 256, y);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [color, spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Orbital rotation
    if (groupRef.current) {
      const angle = initialAngle + time * orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      // Slight vertical movement for depth
      groupRef.current.position.y = Math.sin(angle * 2) * 0.5;
    }
    
    // Axis rotation
    if (planetRef.current) {
      planetRef.current.rotation.y = time * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet body */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          map={spotTexture}
          emissive={color}
          emissiveIntensity={0.1}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[size * 1.08, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      
      {/* Ring */}
      {hasRing && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2, 64]} />
          <meshBasicMaterial 
            color={ringColor || color} 
            transparent 
            opacity={0.5} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Satellite */}
      {hasSatellite && (
        <Satellite orbitRadius={size * 2} speed={2} size={size * 0.15} />
      )}
    </group>
  );
};

// Space Station
const SpaceStation = ({ position }: { position: [number, number, number] }) => {
  const stationRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stationRef.current) {
      stationRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={stationRef} position={position}>
      {/* Central hub */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Ring structure */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.2, 8, 32]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Spokes */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh 
          key={i} 
          position={[Math.cos(angle * Math.PI / 180), 0, Math.sin(angle * Math.PI / 180)]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#777777" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      
      {/* Solar panels */}
      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.8]} />
        <meshStandardMaterial color="#1a3a5c" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.8]} />
        <meshStandardMaterial color="#1a3a5c" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Lights */}
      <pointLight color="#00ff00" intensity={0.5} distance={5} position={[0, 0.3, 0]} />
      <pointLight color="#ff0000" intensity={0.3} distance={3} position={[2, 0, 0]} />
    </group>
  );
};

// Main Galaxy Scene
const GalaxyScene = () => {
  const planets = [
    { orbitRadius: 12, size: 0.8, color: "#ff6644", orbitSpeed: 0.3, rotationSpeed: 2, spotColor: "#ffaa88", hasSatellite: true, initialAngle: 0 },
    { orbitRadius: 18, size: 1.2, color: "#44aaff", orbitSpeed: 0.2, rotationSpeed: 1.5, spotColor: "#88ccff", hasRing: true, ringColor: "#6688aa", initialAngle: Math.PI * 0.5 },
    { orbitRadius: 25, size: 0.6, color: "#88ff66", orbitSpeed: 0.25, rotationSpeed: 3, spotColor: "#aaffaa", initialAngle: Math.PI },
    { orbitRadius: 32, size: 2, color: "#ffaa44", orbitSpeed: 0.1, rotationSpeed: 0.8, spotColor: "#ffcc88", hasRing: true, ringColor: "#cc8844", hasSatellite: true, initialAngle: Math.PI * 1.3 },
    { orbitRadius: 40, size: 1.5, color: "#aa66ff", orbitSpeed: 0.08, rotationSpeed: 1, spotColor: "#cc99ff", hasSatellite: true, initialAngle: Math.PI * 0.7 },
    { orbitRadius: 50, size: 0.9, color: "#ff66aa", orbitSpeed: 0.15, rotationSpeed: 1.8, spotColor: "#ff99cc", initialAngle: Math.PI * 1.8 },
    { orbitRadius: 60, size: 1.8, color: "#66ffff", orbitSpeed: 0.05, rotationSpeed: 0.6, spotColor: "#99ffff", hasRing: true, ringColor: "#44aaaa", initialAngle: Math.PI * 0.3 },
  ];

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[20, 20, 10]} intensity={0.3} />
      
      <BlinkingStars count={3000} />
      
      <GalaxyCore />
      
      {/* Orbital paths */}
      {planets.map((planet, i) => (
        <OrbitalPath key={`orbit-${i}`} radius={planet.orbitRadius} color={planet.color} />
      ))}
      
      {/* Planets */}
      {planets.map((planet, i) => (
        <Planet key={`planet-${i}`} {...planet} />
      ))}
      
      {/* Space Station in distance */}
      <SpaceStation position={[45, 8, -30]} />
      
      {/* Nebula fog for depth */}
      <fog attach="fog" args={["#0a0a1a", 80, 250]} />
    </>
  );
};

const GalaxyExploration = ({ vehicle }: GalaxyExplorationProps) => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        camera={{ position: [30, 40, 80], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <GalaxyScene />
          <OrbitControls 
            enablePan={false}
            minDistance={30}
            maxDistance={150}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-border/50">
          <h2 className="text-foreground text-xl font-bold mb-1">Galaxy Explorer</h2>
          <p className="text-muted-foreground text-sm">
            {vehicle === "rocket" ? "🚀" : "🧑‍🚀"} Viewing as {vehicle === "rocket" ? "Rocket" : "Astronaut"}
          </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
          <p className="text-muted-foreground text-sm">Planets</p>
          <p className="text-foreground text-2xl font-bold text-accent">7</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/30">
          <p className="text-muted-foreground text-sm text-center">
            🖱️ Drag to rotate • Scroll to zoom • Explore the solar system
          </p>
        </div>
      </div>

      {/* Planet info legend */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-border/30">
          <p className="text-foreground text-xs font-semibold mb-2">Solar System</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff6644]" />
              <span className="text-muted-foreground text-xs">Mercury</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#44aaff]" />
              <span className="text-muted-foreground text-xs">Venus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#88ff66]" />
              <span className="text-muted-foreground text-xs">Earth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ffaa44]" />
              <span className="text-muted-foreground text-xs">Mars</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#aa66ff]" />
              <span className="text-muted-foreground text-xs">Jupiter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff66aa]" />
              <span className="text-muted-foreground text-xs">Saturn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#66ffff]" />
              <span className="text-muted-foreground text-xs">Neptune</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalaxyExploration;