import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import Corridor from "./Corridor";
import HexagonalWindow from "./HexagonalWindow";
import ExitOptions from "./ExitOptions";
import PlayerControls from "./PlayerControls";

interface SpaceStationSceneProps {
  onExit: (vehicle: "rocket" | "astronaut") => void;
}

const SpaceStationScene = ({ onExit }: SpaceStationSceneProps) => {
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const handleSelectVehicle = useCallback((vehicle: "rocket" | "astronaut") => {
    setControlsEnabled(false);
    // Delay to allow any exit animation
    setTimeout(() => onExit(vehicle), 500);
  }, [onExit]);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.3} />
          
          {/* Main directional light */}
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          
          {/* Background stars visible through window */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Space station corridor */}
          <Corridor />
          
          {/* Hexagonal window with galaxy view */}
          <HexagonalWindow position={[0, 0, -7]} />
          
          {/* Exit options with 3D models */}
          <ExitOptions position={[0, 0, 4.5]} onSelectVehicle={handleSelectVehicle} />

          {/* Player WASD controls */}
          <PlayerControls enabled={controlsEnabled} />

          {/* Environment for reflections */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
          <p className="text-foreground/90 text-sm font-mono">
            <span className="text-accent">WASD</span> to move • 
            <span className="text-accent ml-2">SPACE</span> up • 
            <span className="text-accent ml-2">SHIFT</span> down
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpaceStationScene;
