import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import Corridor from "./Corridor";
import HexagonalWindow from "./HexagonalWindow";
import ExitOptions from "./ExitOptions";
import PlayerControls from "./PlayerControls";

interface SpaceStationSceneProps {
  onExit: (vehicle: "rocket" | "astronaut") => void;
}

const SpaceStationScene = ({ onExit }: SpaceStationSceneProps) => {
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelectVehicle = useCallback((vehicle: "rocket" | "astronaut") => {
    setControlsEnabled(false);
    document.exitPointerLock();
    setTimeout(() => onExit(vehicle), 500);
  }, [onExit]);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
        onPointerDown={() => setIsLocked(true)}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />
          
          {/* Main directional light */}
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <pointLight position={[0, 2, 0]} intensity={0.5} color="#4fc3f7" />
          
          {/* Background stars visible through window */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Space station corridor */}
          <Corridor />
          
          {/* Hexagonal window with galaxy view - in front */}
          <HexagonalWindow position={[0, 0, -7]} />
          
          {/* Exit options with 3D models - also in front, closer */}
          <ExitOptions position={[0, -0.5, -4]} onSelectVehicle={handleSelectVehicle} />

          {/* Player WASD + mouse controls */}
          <PlayerControls enabled={controlsEnabled} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
          <p className="text-foreground/90 text-sm font-mono">
            <span className="text-accent">Click</span> to look around • 
            <span className="text-accent ml-2">WASD</span> to move • 
            <span className="text-accent ml-2">SPACE/SHIFT</span> up/down •
            <span className="text-accent ml-2">ESC</span> to release
          </p>
        </div>
      </div>

      {/* Click to start overlay */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm pointer-events-none">
          <div className="text-center animate-pulse">
            <p className="text-foreground text-xl font-mono">Click to explore</p>
            <p className="text-muted-foreground text-sm mt-2">Move mouse to look around</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceStationScene;
