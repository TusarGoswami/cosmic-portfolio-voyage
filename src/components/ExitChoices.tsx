import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Galaxy visible through station window
const GalaxyView = () => {
  const galaxyRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spiral galaxy pattern
      const radius = Math.random() * 40 + 5;
      const spinAngle = radius * 0.4;
      const branchAngle = ((i % 4) / 4) * Math.PI * 2;
      const randomX = (Math.random() - 0.5) * 3;
      const randomY = (Math.random() - 0.5) * 2;
      const randomZ = (Math.random() - 0.5) * 3;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY - 20;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ - 50;

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
      mixedColor.lerpColors(innerColor, outerColor, radius / 45);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z = state.clock.elapsedTime * 0.015;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group position={[0, -5, -60]}>
      {/* Galaxy core glow */}
      <mesh ref={coreRef} position={[0, -15, 0]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ffdd66" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -15, 0]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -15, 0]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ff6644" transparent opacity={0.15} />
      </mesh>

      {/* Galaxy spiral */}
      <points ref={galaxyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={5000} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={5000} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={5000} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Distant planets */}
      <mesh position={[-25, -10, -20]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#7c4dff" emissive="#4a2d99" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[30, -25, -15]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial color="#ff7755" emissive="#993322" emissiveIntensity={0.4} />
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

      {/* Wall panels - left */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`panel-l-${i}`} position={[-9.8, 1, -6 + i * 4]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[2, 3, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.6, 0.1, 0.02]} />
            <meshBasicMaterial color="#4fc3f7" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Wall panels - right */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`panel-r-${i}`} position={[9.8, 1, -6 + i * 4]}>
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[2, 3, 0.1]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[-0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[1.6, 0.1, 0.02]} />
            <meshBasicMaterial color="#4fc3f7" transparent opacity={0.8} />
          </mesh>
        </group>
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

      {/* Equipment consoles */}
      <mesh position={[-8, -1.5, 5]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-8, 0.2, 5]} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <planeGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#0a2a1a" />
      </mesh>

      <mesh position={[8, -1.5, 5]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[8, 0.2, 5]} rotation={[Math.PI / 4, -Math.PI / 6, 0]}>
        <planeGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#2a0a1a" />
      </mesh>
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
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} />
          <pointLight position={[0, 5, 0]} intensity={0.4} color="#4fc3f7" />

          {/* Space station interior */}
          <StationInterior />

          {/* Galaxy visible through window */}
          <GalaxyView />

          {/* Background stars */}
          <Stars radius={150} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

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

      {/* Title overlay */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
          Choose Your Vehicle
        </h1>
        <p className="text-muted-foreground text-lg">Click to select your space adventure</p>
      </div>

      {/* Hover hint */}
      {hovered && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
            <p className="text-foreground text-lg font-semibold">
              {hovered === "rocket" ? "🚀 Rocket - Fast & Powerful" : "🧑‍🚀 Astronaut - Free & Agile"}
            </p>
            <p className="text-muted-foreground text-sm">Click to select</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitChoices;
