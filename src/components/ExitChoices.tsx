import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import ExitModels from "./ExitModels";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

const ExitChoices = ({ onSelect }: ExitChoicesProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[0, 3, 0]} intensity={0.5} color="#4fc3f7" />
          
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

          <ExitModels onSelect={onSelect} hovered={hovered} setHovered={setHovered} />

          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
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
