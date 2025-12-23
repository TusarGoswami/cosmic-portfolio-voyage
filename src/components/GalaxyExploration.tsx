import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

interface GalaxyExplorationProps {
  vehicle: "rocket" | "astronaut";
}

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

// Nebula clouds for atmosphere
const NebulaCloud = ({ position, color, size }: { position: [number, number, number]; color: string; size: number }) => {
  const cloudRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const r = Math.random() * size;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [size]);

  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={cloudRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={2} color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// Central Sun/Galaxy Core - BIGGER and more attractive
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Points>(null);
  const flareRef = useRef<THREE.Points>(null);

  const coronaParticles = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 10 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  const flareParticles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return positions;
  }, []);

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
    if (coronaRef.current) {
      coronaRef.current.rotation.y = time * 0.03;
      coronaRef.current.rotation.x = time * 0.02;
    }
    if (flareRef.current) {
      flareRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group>
      {/* Core sun - BIGGER */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>
      
      {/* Inner glow layer 1 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>
      
      {/* Inner glow layer 2 */}
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[10.5, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[13, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>
      
      {/* Extended glow */}
      <mesh>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.08} />
      </mesh>
      
      {/* Corona particles */}
      <points ref={coronaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={1500} array={coronaParticles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ffdd44" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Solar flare ring */}
      <points ref={flareRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={500} array={flareParticles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#ffaa00" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Sun light - stronger */}
      <pointLight color="#ffdd44" intensity={5} distance={200} />
      <pointLight color="#ff8800" intensity={2} distance={100} />
    </group>
  );
};

// Orbital Path - more visible
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

// Planet with all features - BIGGER
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
  glowColor,
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
  glowColor?: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const spotTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.3, spotColor || color);
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, spotColor || color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      // Larger spots
      ctx.fillStyle = spotColor || "rgba(255,255,255,0.25)";
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 15;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Storm spots
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Atmospheric bands
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
  }, [color, spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      const angle = initialAngle + time * orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 2) * 1;
    }
    
    if (planetRef.current) {
      planetRef.current.rotation.y = time * rotationSpeed;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * rotationSpeed * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet body */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={spotTexture}
          emissive={color}
          emissiveIntensity={0.15}
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>
      
      {/* Inner atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshBasicMaterial color={glowColor || color} transparent opacity={0.2} />
      </mesh>
      
      {/* Outer atmosphere glow */}
      <mesh>
        <sphereGeometry args={[size * 1.15, 32, 32]} />
        <meshBasicMaterial color={glowColor || color} transparent opacity={0.1} />
      </mesh>
      
      {/* Ring */}
      {hasRing && (
        <>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.2, 128]} />
            <meshBasicMaterial color={ringColor || color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[size * 2.2, size * 2.5, 128]} />
            <meshBasicMaterial color={ringColor || color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      
      {/* Satellite */}
      {hasSatellite && (
        <Satellite orbitRadius={size * 2.5} speed={1.5} size={size * 0.2} />
      )}
      
      {/* Planet light reflection */}
      <pointLight color={color} intensity={0.3} distance={size * 5} />
    </group>
  );
};

// Space Station - BIGGER
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

// Main Galaxy Scene
const GalaxyScene = () => {
  // BIGGER planets with more spacing
  const planets = [
    { orbitRadius: 22, size: 2, color: "#ff7755", orbitSpeed: 0.25, rotationSpeed: 1.8, spotColor: "#ffaa88", glowColor: "#ff9966", hasSatellite: true, initialAngle: 0 },
    { orbitRadius: 32, size: 2.8, color: "#55aaff", orbitSpeed: 0.18, rotationSpeed: 1.4, spotColor: "#88ccff", glowColor: "#77bbff", hasRing: true, ringColor: "#8899bb", initialAngle: Math.PI * 0.5 },
    { orbitRadius: 44, size: 2.5, color: "#66ff88", orbitSpeed: 0.22, rotationSpeed: 2.5, spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI },
    { orbitRadius: 58, size: 5, color: "#ffbb55", orbitSpeed: 0.08, rotationSpeed: 0.6, spotColor: "#ffdd88", glowColor: "#ffcc66", hasRing: true, ringColor: "#ddaa66", hasSatellite: true, initialAngle: Math.PI * 1.3 },
    { orbitRadius: 75, size: 4, color: "#bb77ff", orbitSpeed: 0.06, rotationSpeed: 0.8, spotColor: "#dd99ff", glowColor: "#cc88ff", hasSatellite: true, initialAngle: Math.PI * 0.7 },
    { orbitRadius: 92, size: 2.2, color: "#ff77aa", orbitSpeed: 0.12, rotationSpeed: 1.5, spotColor: "#ff99cc", glowColor: "#ff88bb", initialAngle: Math.PI * 1.8 },
    { orbitRadius: 110, size: 4.5, color: "#77ffff", orbitSpeed: 0.04, rotationSpeed: 0.5, spotColor: "#99ffff", glowColor: "#88ffff", hasRing: true, ringColor: "#66cccc", hasSatellite: true, initialAngle: Math.PI * 0.3 },
  ];

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[30, 30, 15]} intensity={0.4} />
      
      <BlinkingStars count={5000} />
      
      {/* Nebula clouds for atmosphere */}
      <NebulaCloud position={[-80, 20, -100]} color="#ff6688" size={40} />
      <NebulaCloud position={[100, -30, -80]} color="#6688ff" size={50} />
      <NebulaCloud position={[50, 40, -150]} color="#88ff66" size={35} />
      
      <GalaxyCore />
      
      {/* Orbital paths */}
      {planets.map((planet, i) => (
        <OrbitalPath key={`orbit-${i}`} radius={planet.orbitRadius} color={planet.color} />
      ))}
      
      {/* Planets */}
      {planets.map((planet, i) => (
        <Planet key={`planet-${i}`} {...planet} />
      ))}
      
      {/* Space Station */}
      <SpaceStation position={[70, 15, -50]} />
      
      {/* Nebula fog */}
      <fog attach="fog" args={["#050510", 120, 400]} />
    </>
  );
};

const GalaxyExploration = ({ vehicle }: GalaxyExplorationProps) => {
  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d25] to-[#050515]">
      <Canvas 
        camera={{ position: [50, 60, 120], fov: 55 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <GalaxyScene />
          <OrbitControls 
            enablePan={false}
            minDistance={50}
            maxDistance={250}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.2}
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

      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-5 py-3 border border-accent/30 shadow-lg shadow-accent/10">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Planets</p>
          <p className="text-foreground text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">7</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-gradient-to-r from-background/70 via-background/80 to-background/70 backdrop-blur-md rounded-full px-8 py-3 border border-border/30 shadow-lg">
          <p className="text-muted-foreground text-sm text-center">
            🖱️ Drag to rotate • Scroll to zoom • Explore the solar system
          </p>
        </div>
      </div>

      {/* Planet legend */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-4 py-3 border border-border/30 shadow-lg">
          <p className="text-foreground text-xs font-semibold mb-3 uppercase tracking-wider">Solar System</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { color: "#ff7755", name: "Mercury" },
              { color: "#55aaff", name: "Venus" },
              { color: "#66ff88", name: "Earth" },
              { color: "#ffbb55", name: "Mars" },
              { color: "#bb77ff", name: "Jupiter" },
              { color: "#ff77aa", name: "Saturn" },
              { color: "#77ffff", name: "Neptune" },
            ].map((planet, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: planet.color, boxShadow: `0 0 8px ${planet.color}` }} />
                <span className="text-muted-foreground text-xs">{planet.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalaxyExploration;