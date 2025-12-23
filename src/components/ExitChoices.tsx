import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Galaxy component
const Galaxy = () => {
  const galaxyRef = useRef<THREE.Points>(null);
  const particlesCount = 8000;
  
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 30 + 5;
    const spinAngle = radius * 0.5;
    const branchAngle = ((i % 4) / 4) * Math.PI * 2;
    
    const randomX = (Math.random() - 0.5) * 3 * (1 - radius / 35);
    const randomY = (Math.random() - 0.5) * 1.5 * (1 - radius / 35);
    const randomZ = (Math.random() - 0.5) * 3 * (1 - radius / 35);
    
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY - 15;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ - 20;
    
    // Color gradient from center (orange/yellow) to edges (blue/purple)
    const mixRatio = radius / 35;
    colors[i3] = 1 - mixRatio * 0.7;
    colors[i3 + 1] = 0.5 - mixRatio * 0.3;
    colors[i3 + 2] = 0.2 + mixRatio * 0.8;
  }
  
  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });
  
  return (
    <points ref={galaxyRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Camera controller that follows mouse
const CameraController = () => {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  useFrame(() => {
    // Smoothly move camera based on mouse position
    const targetX = mousePos.current.x * 3;
    const targetY = 2 - mousePos.current.y * 2;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

const ExitChoices = ({ onSelect }: ExitChoicesProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[0, 3, 0]} intensity={0.5} color="#4fc3f7" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Galaxy visible in lower half */}
          <Galaxy />

          <ExitModels onSelect={onSelect} hovered={hovered} setHovered={setHovered} />

          <CameraController />
        </Suspense>
      </Canvas>

      {/* Title overlay */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
          Choose Your Vehicle
        </h1>
        <p className="text-muted-foreground text-lg">Click to select your space adventure</p>
      </div>

      {/* Instruction overlay */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/30">
          <p className="text-muted-foreground text-sm animate-pulse">
            ✨ Move your cursor to see the galaxy
          </p>
        </div>
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
