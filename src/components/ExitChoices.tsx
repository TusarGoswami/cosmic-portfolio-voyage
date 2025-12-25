import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Holographic Display Component
const HolographicDisplay = ({ position, rotation = [0, 0, 0], size = [2, 1.5], color = "#00ffff", title = "SYSTEM" }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  color?: string;
  title?: string;
}) => {
  const displayRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const dataRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (displayRef.current) {
      displayRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
    }
    
    if (scanLineRef.current) {
      scanLineRef.current.position.y = ((time * 0.5) % 1 - 0.5) * size[1];
    }
    
    if (dataRef.current) {
      dataRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.material.opacity = 0.3 + Math.sin(time * 3 + i) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={displayRef} position={position} rotation={rotation as any}>
      {/* Hologram base */}
      <mesh position={[0, -size[1] / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Projection beam */}
      <mesh position={[0, -size[1] / 4, 0]}>
        <coneGeometry args={[0.5, size[1] / 2, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Main display panel */}
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Border frame */}
      <mesh>
        <edgesGeometry args={[new THREE.PlaneGeometry(size[0], size[1])]} />
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Scan line */}
      <mesh ref={scanLineRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[size[0], 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Data bars */}
      <group ref={dataRef} position={[-size[0] / 2 + 0.2, 0, 0.01]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -size[1] / 2 + 0.3 + i * 0.25, 0]}>
            <planeGeometry args={[0.3 + Math.random() * 0.8, 0.08]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Corner accents */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
        <mesh key={i} position={[x * (size[0] / 2 - 0.1), y * (size[1] / 2 - 0.1), 0.01]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Glow effect */}
      <pointLight position={[0, 0, 0.5]} color={color} intensity={0.3} distance={3} />
    </group>
  );
};

// Interactive Control Panel
const ControlPanelStation = ({ position, rotation = [0, 0, 0], side = "left" }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  side?: "left" | "right";
}) => {
  const panelRef = useRef<THREE.Group>(null);
  const buttonsRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  const accentColor = side === "left" ? "#00ffaa" : "#ff6699";

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (buttonsRef.current) {
      buttonsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          const pulse = Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5;
          child.material.opacity = 0.5 + pulse * 0.5;
        }
      });
    }
    
    if (screenRef.current && screenRef.current.material instanceof THREE.MeshBasicMaterial) {
      screenRef.current.material.opacity = 0.6 + Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group ref={panelRef} position={position} rotation={rotation as any}>
      {/* Main console body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 3, 1.2]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Angled screen top */}
      <mesh position={[0, 1.2, 0.3]} rotation={[-Math.PI / 5, 0, 0]}>
        <boxGeometry args={[2.2, 1, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Screen display */}
      <mesh ref={screenRef} position={[0, 1.25, 0.38]} rotation={[-Math.PI / 5, 0, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
      </mesh>

      {/* Screen frame */}
      <mesh position={[0, 1.25, 0.39]} rotation={[-Math.PI / 5, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.9, 0.85)]} />
        <lineBasicMaterial color={accentColor} />
      </mesh>

      {/* Button panel */}
      <mesh position={[0, 0.3, 0.65]}>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Buttons */}
      <group ref={buttonsRef} position={[0, 0.3, 0.72]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ff8844", "#88ff44"];
          return (
            <mesh key={i} position={[-0.6 + col * 0.4, 0.15 - row * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
              <meshBasicMaterial color={colors[i]} transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* Slider controls */}
      <group position={[0, -0.5, 0.65]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={i} position={[-0.5 + i * 0.5, 0, 0.05]}>
            <mesh>
              <boxGeometry args={[0.1, 0.6, 0.02]} />
              <meshStandardMaterial color="#333344" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.1 + Math.random() * 0.2, 0.02]}>
              <boxGeometry args={[0.15, 0.1, 0.03]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        ))}
      </group>

      {/* LED strip on base */}
      <mesh position={[0, -1.4, 0.55]}>
        <boxGeometry args={[2.3, 0.05, 0.05]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      {/* Side lights */}
      <pointLight position={[1, 0, 1]} color={accentColor} intensity={0.3} distance={4} />
    </group>
  );
};

// Rotating Data Cylinder Hologram
const DataCylinder = ({ position }: { position: [number, number, number] }) => {
  const cylinderRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (cylinderRef.current) {
      cylinderRef.current.rotation.y = time * 0.5;
    }
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x = time * (0.3 + i * 0.1);
          child.position.y = Math.sin(time + i) * 0.1;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Holographic cylinder */}
      <group ref={cylinderRef}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 16, 1, true]} />
          <meshBasicMaterial color="#7c4dff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Data lines on cylinder */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.31, 0, 0]}>
            <boxGeometry args={[0.02, 1, 0.01]} />
            <meshBasicMaterial color="#7c4dff" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Rotating rings */}
      <group ref={ringsRef}>
        {[0.4, 0.5, 0.6].map((radius, i) => (
          <mesh key={i} position={[0, -0.2 + i * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.02, 8, 32]} />
            <meshBasicMaterial color="#7c4dff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Top cap */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#7c4dff" transparent opacity={0.5} />
      </mesh>

      <pointLight position={[0, 0, 0]} color="#7c4dff" intensity={0.5} distance={3} />
    </group>
  );
};

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

      {/* Window frame - large panoramic - transparent */}
      <mesh position={[0, 1, -9.9]}>
        <ringGeometry args={[6, 7, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1, -9.85]}>
        <ringGeometry args={[5.8, 6, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Window cross dividers - transparent */}
      <mesh position={[0, 1, -9.8]}>
        <boxGeometry args={[12, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1, -9.8]}>
        <boxGeometry args={[0.15, 12, 0.1]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Side walls - white */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
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

      {/* Holographic displays */}
      <HolographicDisplay position={[-7, 3, -8]} rotation={[0, 0.3, 0]} color="#00ffff" title="NAVIGATION" />
      <HolographicDisplay position={[7, 3, -8]} rotation={[0, -0.3, 0]} color="#ff6699" title="SYSTEMS" />
      <HolographicDisplay position={[-8.5, 4, 2]} rotation={[0, Math.PI / 2, 0]} size={[1.5, 1.2]} color="#00ffaa" title="COMMS" />
      <HolographicDisplay position={[8.5, 4, 2]} rotation={[0, -Math.PI / 2, 0]} size={[1.5, 1.2]} color="#ffaa00" title="POWER" />

      {/* Control panel stations */}
      <ControlPanelStation position={[-7, -2, 4]} rotation={[0, Math.PI / 5, 0]} side="left" />
      <ControlPanelStation position={[7, -2, 4]} rotation={[0, -Math.PI / 5, 0]} side="right" />

      {/* Data cylinders */}
      <DataCylinder position={[-4, -2.5, -6]} />
      <DataCylinder position={[4, -2.5, -6]} />

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
