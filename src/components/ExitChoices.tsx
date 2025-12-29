import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Text, Float, Sparkles } from "@react-three/drei";
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

// Volumetric light beams
const LightBeams = () => {
  const beamsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (beamsRef.current) {
      beamsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = 0.05 + Math.sin(time + i * 0.5) * 0.03;
        }
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {/* Beam from window */}
      <mesh position={[0, 0, -5]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[8, 15, 32, 1, true]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Spotlight beams on vehicles */}
      <mesh position={[-4, 4, 2]} rotation={[0.4, 0.2, 0]}>
        <coneGeometry args={[3, 8, 16, 1, true]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4, 4, 2]} rotation={[0.4, -0.2, 0]}>
        <coneGeometry args={[3, 8, 16, 1, true]} />
        <meshBasicMaterial color="#ff6699" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Galaxy visible through station window - Large and prominent
const GalaxyView = () => {
  const galaxyRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spiral galaxy pattern - larger radius for bigger galaxy
      const radius = Math.random() * 60 + 8;
      const spinAngle = radius * 0.35;
      const branchAngle = ((i % 4) / 4) * Math.PI * 2;
      const randomX = (Math.random() - 0.5) * 4;
      const randomY = (Math.random() - 0.5) * 3;
      const randomZ = (Math.random() - 0.5) * 4;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY + 5;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ - 30;

      // Colors - multi-color gradient
      const mixedColor = new THREE.Color();
      const innerColors = [
        new THREE.Color("#ffcc66"),
        new THREE.Color("#ff9966"),
        new THREE.Color("#ff6699"),
      ];
      const outerColors = [
        new THREE.Color("#4fc3f7"),
        new THREE.Color("#7c4dff"),
        new THREE.Color("#e1bee7"),
      ];
      
      const innerColor = innerColors[i % 3];
      const outerColor = outerColors[i % 3];
      mixedColor.lerpColors(innerColor, outerColor, radius / 68);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2.5 + 0.8;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z = state.clock.elapsedTime * 0.012;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.15);
    }
  });

  return (
    <group position={[0, 8, -35]}>
      {/* Galaxy core glow - larger and brighter */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#ffdd66" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#ff6644" transparent opacity={0.2} />
      </mesh>

      {/* Galaxy spiral */}
      <points ref={galaxyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={8000} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={8000} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={8000} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Distant planets - repositioned */}
      <mesh position={[-35, 5, -10]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial color="#7c4dff" emissive="#4a2d99" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[40, -10, -5]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#ff7755" emissive="#993322" emissiveIntensity={0.5} />
      </mesh>
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
        <meshStandardMaterial color="#D4A574" metalness={0.9} roughness={0.2} emissive="#3a2a1a" emissiveIntensity={0.3} />
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

      {/* Ceiling lights */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`ceiling-light-${i}`} position={[0, 7.5, -6 + i * 6]}>
          <mesh>
            <boxGeometry args={[4, 0.1, 0.5]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
          </mesh>
          <pointLight position={[0, -1, 0]} color="#ffffff" intensity={0.8} distance={12} />
        </group>
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
      
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, 8, 0]} intensity={0.6} color="#4fc3f7" />
          <pointLight position={[-5, 3, 5]} intensity={0.4} color="#00ffaa" />
          <pointLight position={[5, 3, 5]} intensity={0.4} color="#ff6699" />
          
          {/* Fog for depth */}
          <fog attach="fog" args={['#0a0a1a', 15, 80]} />

          {/* Space station interior */}
          <StationInterior />

          {/* Galaxy visible through window */}
          <GalaxyView />
          
          {/* Nebula clouds */}
          <NebulaEffect />
          
          {/* Volumetric light beams */}
          <LightBeams />

          {/* Background stars - enhanced */}
          <Stars radius={200} depth={80} count={5000} factor={4} saturation={0.5} fade speed={0.3} />
          
          {/* Floating sparkles */}
          <Sparkles count={100} scale={20} size={2} speed={0.3} opacity={0.5} color="#4fc3f7" />
          <Sparkles count={50} scale={15} size={3} speed={0.2} opacity={0.3} color="#ff6699" position={[0, 2, -5]} />


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
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3 tracking-wider">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              SELECT VEHICLE
            </span>
          </h1>
          <motion.div 
            className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-muted-foreground text-lg mt-3 tracking-wide">
          Choose your path through the cosmos
        </p>
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
            <div className={`
              relative overflow-hidden rounded-xl px-8 py-4 
              ${hovered === "rocket" 
                ? "bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 border border-emerald-400/50" 
                : "bg-gradient-to-r from-pink-900/80 to-purple-900/80 border border-pink-400/50"
              } 
              backdrop-blur-md shadow-2xl
            `}>
              {/* Animated shine effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              
              <p className="text-foreground text-xl font-bold tracking-wide relative z-10">
                {hovered === "rocket" ? "🚀 ROCKET" : "🧑‍🚀 ASTRONAUT"}
              </p>
              <p className={`text-sm mt-1 relative z-10 ${hovered === "rocket" ? "text-emerald-300" : "text-pink-300"}`}>
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
