import { Suspense, useState, useCallback, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Corridor from "./Corridor";
import HexagonalWindow from "./HexagonalWindow";
import ExitOptions from "./ExitOptions";
import PlayerControls from "./PlayerControls";

// Custom Stars with Exclusion Zone
const CustomStars = ({ count = 5000, radius = 50, depth = 50 }) => {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    // Bounding box / exclusion zone for space station
    // The space station is roughly centered around the origin, X/Y within [-10, 10] and Z within [-20, 10]
    // A safe exclusion radius of 40 ensures no star spawns inside this restricted area.
    const exclusionRadiusSq = 40 * 40;

    let validStars = 0;
    while (validStars < count) {
      // Random generation in a large sphere wrapper
      const r = radius + Math.random() * depth;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // --- Reject if inside the Space Station ---
      if (x * x + y * y + z * z < exclusionRadiusSq) {
        continue; // discard and regenerate to maintain star density
      }

      positions[validStars * 3] = x;
      positions[validStars * 3 + 1] = y;
      positions[validStars * 3 + 2] = z;

      sizes[validStars] = Math.random() * 2 + 0.8;
      phases[validStars] = Math.random() * Math.PI * 2;

      const shade = Math.random() * 0.4 + 0.6;
      colors[validStars * 3] = shade;
      colors[validStars * 3 + 1] = shade;
      colors[validStars * 3 + 2] = 1.0;

      validStars++;
    }

    return { positions, sizes, phases, colors };
  }, [count, radius, depth]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime * 0.5;
      const sizesAttr = starsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const blink = Math.sin(time + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.3 + blink * 0.7);
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
        size={1.5}
        vertexColors
        transparent
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

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

          {/* Background stars visible through window, avoiding the station */}
          <CustomStars count={5000} radius={60} depth={100} />

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
