import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";
import { motion, AnimatePresence } from "framer-motion";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Animated nebula clouds
const NebulaEffect = () => {
  const nebulaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (nebulaRef.current) {
      nebulaRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.z = time * 0.02 * (i % 2 === 0 ? 1 : -1);
          child.material.opacity = 0.15 + Math.sin(time * 0.5 + i) * 0.05;
        }
      });
    }
  });

  return (
    <group ref={nebulaRef} position={[0, 0, -80]}>
      <mesh position={[-30, 10, -20]}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#7c4dff" transparent opacity={0.15} />
      </mesh>
      <mesh position={[35, -15, -30]}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#ff6699" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 25, -40]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

// Mini Galaxy - matches the original galaxy exploration style
const MiniGalaxy = () => {
  const galaxyRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Create orbital paths and mini planets data
  const planetsData = useMemo(
    () => [
      { orbitRadius: 8, size: 0.8, color: "#ff7755", speed: 0.4, initialAngle: 0 },
      { orbitRadius: 12, size: 1.2, color: "#55aaff", speed: 0.3, initialAngle: Math.PI * 0.5, hasRing: true },
      { orbitRadius: 17, size: 1, color: "#66ff88", speed: 0.35, initialAngle: Math.PI },
      { orbitRadius: 22, size: 2, color: "#ffbb55", speed: 0.15, initialAngle: Math.PI * 1.3, hasRing: true },
      { orbitRadius: 28, size: 1.6, color: "#bb77ff", speed: 0.12, initialAngle: Math.PI * 0.7 },
      { orbitRadius: 34, size: 0.9, color: "#ff77aa", speed: 0.2, initialAngle: Math.PI * 1.8 },
      { orbitRadius: 40, size: 1.8, color: "#77ffff", speed: 0.08, initialAngle: Math.PI * 0.3, hasRing: true },
    ],
    [],
  );

  // Star field
  const { starPositions, starColors, starSizes } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const starColorOptions = [
      [1, 1, 1],
      [1, 0.9, 0.8],
      [0.8, 0.9, 1],
      [1, 0.8, 0.6],
    ];

    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorIdx = Math.floor(Math.random() * starColorOptions.length);
      colors[i * 3] = starColorOptions[colorIdx][0];
      colors[i * 3 + 1] = starColorOptions[colorIdx][1];
      colors[i * 3 + 2] = starColorOptions[colorIdx][2];

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { starPositions: positions, starColors: colors, starSizes: sizes };
  }, []);

  // Planet positions ref for animation
  const planetRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = time * 0.02;
    }

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.1);
    }

    // Animate planets
    planetRefs.current.forEach((planet, i) => {
      if (planet && planetsData[i]) {
        const { orbitRadius, speed, initialAngle } = planetsData[i];
        const angle = time * speed + initialAngle;
        planet.position.x = Math.cos(angle) * orbitRadius;
        planet.position.z = Math.sin(angle) * orbitRadius;
      }
    });
  });

  return (
    <group ref={galaxyRef} position={[0, 5, -50]} rotation={[0.3, 0, 0.1]}>
      {/* Central Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>

      {/* Sun glow layers */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>

      {/* Orbital paths */}
      {planetsData.map((planet, i) => (
        <mesh key={`orbit-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.orbitRadius - 0.05, planet.orbitRadius + 0.05, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Planets */}
      {planetsData.map((planet, i) => (
        <group key={`planet-${i}`}>
          <group
            ref={(el) => {
              if (el) planetRefs.current[i] = el;
            }}
            position={[planet.orbitRadius, 0, 0]}
          >
            <mesh>
              <sphereGeometry args={[planet.size, 32, 32]} />
              <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.2} />
            </mesh>
            {planet.hasRing && (
              <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                <ringGeometry args={[planet.size * 1.4, planet.size * 2, 32]} />
                <meshBasicMaterial color={planet.color} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        </group>
      ))}

      {/* Background stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3000} array={starPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={3000} array={starColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Sun light */}
      <pointLight color="#ffdd44" intensity={3} distance={100} />
    </group>
  );
};

// Space station interior
const StationInterior = () => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Floor grid lines */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`grid-x-${i}`} position={[-10 + i, -3.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 20]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`grid-z-${i}`} position={[0, -3.49, -10 + i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 0.02]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Back wall with large window opening */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Window frame - large panoramic */}
      <mesh position={[0, 1, -9.9]}>
        <ringGeometry args={[6, 7, 64]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1, -9.85]}>
        <ringGeometry args={[5.8, 6, 64]} />
        <meshStandardMaterial
          color="#D4A574"
          metalness={0.9}
          roughness={0.2}
          emissive="#3a2a1a"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Window cross dividers */}
      <mesh position={[0, 1, -9.8]}>
        <boxGeometry args={[12, 0.15, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1, -9.8]}>
        <boxGeometry args={[0.15, 12, 0.1]} />
        <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Ceiling ribs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`rib-${i}`} position={[0, 7.9, -8 + i * 4]}>
          <boxGeometry args={[20, 0.2, 0.3]} />
          <meshStandardMaterial color="#B87333" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* LED strips on floor edges */}
      <mesh position={[-9.5, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[9.5, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -3.4, -9.5]}>
        <boxGeometry args={[18, 0.05, 0.1]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.9} />
      </mesh>

      {/* Ceiling lights - now just point lights without visible boxes */}
      {Array.from({ length: 3 }).map((_, i) => (
        <pointLight 
          key={`ceiling-light-${i}`} 
          position={[0, 7.5, -6 + i * 6]} 
          color="#ffffff" 
          intensity={0.8} 
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

          {/* Space station interior */}
          <StationInterior />

          {/* Mini Galaxy visible through window */}
          <MiniGalaxy />

          {/* Nebula clouds */}
          <NebulaEffect />
          {/* Background stars - enhanced */}
          <Stars radius={200} depth={80} count={5000} factor={4} saturation={0.5} fade speed={0.3} />

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

      {/* Enhanced Title overlay with animation */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
      >
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3 tracking-wider"></h1>
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-muted-foreground text-lg mt-3 tracking-wide">Choose your path through the cosmos</p>
      </motion.div>

      {/* Corner decorative elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-pink-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-pink-500/50 pointer-events-none z-20" />

      {/* Enhanced Hover hint with animations */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
          >
            <div
              className={`
              relative overflow-hidden rounded-xl px-8 py-4 
              ${
                hovered === "rocket"
                  ? "bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 border border-emerald-400/50"
                  : "bg-gradient-to-r from-pink-900/80 to-purple-900/80 border border-pink-400/50"
              } 
              backdrop-blur-md shadow-2xl
            `}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />

              <p className="text-foreground text-xl font-bold tracking-wide relative z-10">
                {hovered === "rocket" ? "🚀 ROCKET" : "🧑‍🚀 ASTRONAUT"}
              </p>
              <p
                className={`text-sm mt-1 relative z-10 ${hovered === "rocket" ? "text-emerald-300" : "text-pink-300"}`}
              >
                {hovered === "rocket" ? "Fast & Powerful Navigation" : "Free & Agile Exploration"}
              </p>
              <motion.p
                className="text-xs text-muted-foreground mt-2 relative z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Click to launch
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 text-muted-foreground text-sm pointer-events-none z-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Rocket: Speed & Power</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>Astronaut: Freedom & Control</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ExitChoices;
