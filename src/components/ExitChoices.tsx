import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "./StarField";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Planet data matching GalaxyExploration
const PLANETS_DATA = [
  { id: 0, name: "Pyralis", orbitRadius: 22, size: 2.8, color: "#ff7755", orbitSpeed: 0.25, rotationSpeed: 1.8, spotColor: "#ffaa88", glowColor: "#ff9966", hasSatellite: true, initialAngle: 0 },
  { id: 1, name: "Aquaris", orbitRadius: 32, size: 4, color: "#55aaff", orbitSpeed: 0.18, rotationSpeed: 1.4, spotColor: "#88ccff", glowColor: "#77bbff", hasRing: true, ringColor: "#8899bb", initialAngle: Math.PI * 0.5 },
  { id: 2, name: "Verdania", orbitRadius: 44, size: 3.5, color: "#66ff88", orbitSpeed: 0.22, rotationSpeed: 2.5, spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI },
  { id: 3, name: "Solarius", orbitRadius: 58, size: 7, color: "#ffbb55", orbitSpeed: 0.08, rotationSpeed: 0.6, spotColor: "#ffdd88", glowColor: "#ffcc66", hasRing: true, ringColor: "#ddaa66", hasSatellite: true, initialAngle: Math.PI * 1.3 },
  { id: 4, name: "Nebulora", orbitRadius: 75, size: 5.5, color: "#bb77ff", orbitSpeed: 0.06, rotationSpeed: 0.8, spotColor: "#dd99ff", glowColor: "#cc88ff", hasSatellite: true, initialAngle: Math.PI * 0.7 },
  { id: 5, name: "Rosaria", orbitRadius: 92, size: 3, color: "#ff77aa", orbitSpeed: 0.12, rotationSpeed: 1.5, spotColor: "#ff99cc", glowColor: "#ff88bb", initialAngle: Math.PI * 1.8 },
  { id: 6, name: "Cryonia", orbitRadius: 110, size: 6, color: "#77ffff", orbitSpeed: 0.04, rotationSpeed: 0.5, spotColor: "#99ffff", glowColor: "#88ffff", hasRing: true, ringColor: "#66cccc", hasSatellite: true, initialAngle: Math.PI * 0.3 },
];

// Blinking Stars Background - matching GalaxyExploration
const BlinkingStars = ({ count = 2000 }: { count?: number }) => {
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

// Central Sun/Galaxy Core - matching GalaxyExploration
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

// Orbital Path - matching GalaxyExploration
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

// Planet Component - matching GalaxyExploration style
const GalaxyPlanet = ({ planet }: { planet: typeof PLANETS_DATA[0] }) => {
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
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [planet.color, planet.spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = time * planet.orbitSpeed + planet.initialAngle;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
    }

    if (planetRef.current) {
      planetRef.current.rotation.y = time * planet.rotationSpeed;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * planet.rotationSpeed * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial
          map={spotTexture}
          emissive={planet.color}
          emissiveIntensity={0.15}
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size * 1.05, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.2} />
      </mesh>

      <mesh>
        <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.1} />
      </mesh>

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

      {planet.hasSatellite && (
        <Satellite orbitRadius={planet.size * 2.5} speed={1.5} size={planet.size * 0.2} />
      )}

      <pointLight color={planet.color} intensity={0.3} distance={planet.size * 5} />
    </group>
  );
};

// Galaxy Scene matching GalaxyExploration
const GalaxyScene = () => {
  return (
    <group position={[0, 5, -60]}>
      {/* Central Galaxy Core/Sun */}
      <GalaxyCore />

      {/* Orbital Paths */}
      {PLANETS_DATA.map((planet) => (
        <OrbitalPath key={`orbit-${planet.id}`} radius={planet.orbitRadius} color={planet.glowColor} />
      ))}

      {/* Planets */}
      {PLANETS_DATA.map((planet) => (
        <GalaxyPlanet key={`planet-${planet.id}`} planet={planet} />
      ))}
    </group>
  );
};




// Space station interior with transparent walls
const StationInterior = () => {
  return (
    <group>
      {/* Floor - fully transparent */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a18" transparent opacity={0.0} />
      </mesh>

      {/* Floor grid - removed for transparency */}

      {/* Ceiling - semi-transparent */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a15" transparent opacity={0.6} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* LEFT WALL - Transparent glass */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          transparent
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Left wall frame edges */}
      <mesh position={[-10, -3.5, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-10, 8, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* RIGHT WALL - Transparent glass */}
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          transparent
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right wall frame edges */}
      <mesh position={[10, -3.5, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[10, 8, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* BACK WALL - Transparent glass */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial
          color="#1a2a4a"
          transparent
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Back wall frame edges */}
      <mesh position={[0, -3.5, -10]}>
        <boxGeometry args={[20, 0.15, 0.15]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 8, -10]}>
        <boxGeometry args={[20, 0.15, 0.15]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* Vertical corner pillars */}
      {[[-10, -10], [10, -10], [-10, 10], [10, 10]].map(([x, z], i) => (
        <mesh key={`pillar-${i}`} position={[x, 2.25, z]}>
          <boxGeometry args={[0.2, 11.5, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* LED strips on floor edges */}
      <mesh position={[-9.9, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[9.9, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -3.4, -9.9]}>
        <boxGeometry args={[18, 0.05, 0.1]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.9} />
      </mesh>

      {/* Ceiling lights - point lights only */}
      {Array.from({ length: 3 }).map((_, i) => (
        <pointLight
          key={`ceiling-light-${i}`}
          position={[0, 7.5, -6 + i * 6]}
          color="#ffffff"
          intensity={0.6}
          distance={12}
        />
      ))}

      {/* Corner accent lights */}
      <pointLight position={[-9, -2, -9]} color="#4fc3f7" intensity={0.5} distance={8} />
      <pointLight position={[9, -2, -9]} color="#4fc3f7" intensity={0.5} distance={8} />
      <pointLight position={[-9, -2, 9]} color="#ff6699" intensity={0.4} distance={8} />
      <pointLight position={[9, -2, 9]} color="#ff6699" intensity={0.4} distance={8} />
    </group>
  );
};

const ExitChoices = ({ onSelect }: ExitChoicesProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      {/* CSS twinkling stars — same as start screen */}
      <StarField />

      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-background/20 pointer-events-none z-10" />

      <Canvas camera={{ position: [0, 2, 12], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, 8, 0]} intensity={0.6} color="#4fc3f7" />
          <pointLight position={[-5, 3, 5]} intensity={0.4} color="#00ffaa" />
          <pointLight position={[5, 3, 5]} intensity={0.4} color="#ff6699" />

          {/* Fog for depth */}
          <fog attach="fog" args={["#0a0a1a", 15, 80]} />

          {/* Galaxy Scene matching GalaxyExploration */}
          <GalaxyScene />

          {/* Space station interior with transparent walls */}
          <StationInterior />

          {/* Blinking stars background - matching GalaxyExploration */}
          <BlinkingStars count={5000} />

          {/* Vehicle selection models */}
          <group position={[0, -2, 0]}>
            <ExitModels onSelect={onSelect} hovered={hovered} setHovered={setHovered} />
          </group>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
          />
        </Suspense>
      </Canvas>

      {/* Title — centered horizontally at the top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-14 sm:top-6 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-4"
      >
        <motion.h1
          className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-center"
          style={{
            background: "linear-gradient(90deg, #00e5ff, #ffffff, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(0,229,255,0.5))",
          }}
        >
          ✦ Choose Your Path ✦
        </motion.h1>

        <motion.div
          className="mt-2 h-px w-32 sm:w-48 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #00e5ff, #a855f7, transparent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        <motion.p
          className="mt-1 sm:mt-2 text-xs tracking-[0.15em] sm:tracking-[0.25em] uppercase"
          style={{ color: "rgba(160,160,200,0.7)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          through the cosmos
        </motion.p>
      </motion.div>

      {/* Corner decorative elements — hide on very small screens */}
      <div className="hidden sm:block absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-2 border-t-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-2 border-t-2 border-pink-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-2 border-b-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-2 border-b-2 border-pink-500/50 pointer-events-none z-20" />

      {/* Hover hint — hidden on touch devices, shown on desktop hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:block absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
          >
            <div
              className={`relative overflow-hidden rounded-xl px-6 py-3 backdrop-blur-md shadow-2xl
              ${hovered === "rocket"
                  ? "bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 border border-emerald-400/50"
                  : "bg-gradient-to-r from-pink-900/80 to-purple-900/80 border border-pink-400/50"
                }`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <p className="text-foreground text-lg font-bold tracking-wide relative z-10">
                {hovered === "rocket" ? "🚀 ROCKET" : "🧑‍🚀 ASTRONAUT"}
              </p>
              <p className={`text-sm mt-1 relative z-10 ${hovered === "rocket" ? "text-emerald-300" : "text-pink-300"}`}>
                {hovered === "rocket" ? "Fast & Powerful Navigation" : "Free & Agile Exploration"}
              </p>
              <motion.p
                className="text-xs text-muted-foreground mt-1 relative z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Click to launch
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tap labels — shown only on small screens */}
      <div className="sm:hidden absolute bottom-28 inset-x-0 flex justify-around px-6 pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg">🚀</span>
          <span className="text-xs font-bold text-emerald-400 tracking-wider">ROCKET</span>
          <span className="text-[10px] text-gray-400">Speed & Power</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg">🧑‍🚀</span>
          <span className="text-xs font-bold text-pink-400 tracking-wider">ASTRONAUT</span>
          <span className="text-[10px] text-gray-400">Freedom & Control</span>
        </motion.div>
      </div>

      {/* Bottom instruction bar — stacks on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-1 sm:gap-8 text-muted-foreground text-xs sm:text-sm pointer-events-none z-20 items-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Rocket: Speed & Power</span>
          <span className="sm:hidden">Tap a vehicle to begin</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>Astronaut: Freedom & Control</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ExitChoices;
