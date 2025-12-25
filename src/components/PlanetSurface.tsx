import { Suspense, useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

interface PlanetData {
  id: number;
  name: string;
  color: string;
  glowColor: string;
  description: string;
}

interface PlanetSurfaceProps {
  planet: PlanetData;
  vehicle: "rocket" | "astronaut";
  onTakeoff: () => void;
}

// Keyboard controls
const surfaceKeyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
};

const useSurfaceControls = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || e.code === "ArrowUp") surfaceKeyState.forward = true;
      if (key === "s" || e.code === "ArrowDown") surfaceKeyState.backward = true;
      if (key === "a" || e.code === "ArrowLeft") surfaceKeyState.left = true;
      if (key === "d" || e.code === "ArrowRight") surfaceKeyState.right = true;
      if (key === " ") surfaceKeyState.jump = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || e.code === "ArrowUp") surfaceKeyState.forward = false;
      if (key === "s" || e.code === "ArrowDown") surfaceKeyState.backward = false;
      if (key === "a" || e.code === "ArrowLeft") surfaceKeyState.left = false;
      if (key === "d" || e.code === "ArrowRight") surfaceKeyState.right = false;
      if (key === " ") surfaceKeyState.jump = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { current: surfaceKeyState };
};

// Terrain generation based on planet type
const Terrain = ({ planetColor }: { planetColor: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 100, 100);
    const positions = geo.attributes.position.array as Float32Array;
    const colors = new Float32Array(positions.length);

    const baseColor = new THREE.Color(planetColor);
    const darkColor = baseColor.clone().multiplyScalar(0.5);
    const lightColor = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.3);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      // Generate terrain height using noise-like pattern
      const height = 
        Math.sin(x * 0.05) * 2 +
        Math.cos(y * 0.05) * 2 +
        Math.sin(x * 0.1 + y * 0.1) * 1.5 +
        Math.sin(x * 0.02) * Math.cos(y * 0.02) * 5 +
        (Math.random() - 0.5) * 0.5;
      
      positions[i + 2] = height;

      // Color based on height
      const t = (height + 5) / 15;
      const color = new THREE.Color().lerpColors(darkColor, lightColor, Math.max(0, Math.min(1, t)));
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors };
  }, [planetColor]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geometry}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  );
};

// Rock formations
const Rocks = ({ planetColor }: { planetColor: string }) => {
  const rocks = useMemo(() => {
    const rockData = [];
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      const scale = Math.random() * 2 + 0.5;
      const rotation = Math.random() * Math.PI * 2;
      rockData.push({ x, z, scale, rotation });
    }
    return rockData;
  }, []);

  const rockColor = new THREE.Color(planetColor).multiplyScalar(0.6);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={[rock.x, rock.scale * 0.5, rock.z]}
          rotation={[Math.random() * 0.3, rock.rotation, Math.random() * 0.3]}
          scale={[rock.scale, rock.scale * 1.5, rock.scale]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rockColor} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Crystals for alien planets
const Crystals = ({ planetColor }: { planetColor: string }) => {
  const crystals = useMemo(() => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 150;
      const height = Math.random() * 4 + 2;
      const rotation = Math.random() * Math.PI * 2;
      data.push({ x, z, height, rotation });
    }
    return data;
  }, []);

  return (
    <group>
      {crystals.map((crystal, i) => (
        <group key={i} position={[crystal.x, crystal.height / 2, crystal.z]} rotation={[0, crystal.rotation, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.5, crystal.height, 6]} />
            <meshStandardMaterial
              color={planetColor}
              emissive={planetColor}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
              roughness={0.1}
            />
          </mesh>
          {/* Glow */}
          <pointLight color={planetColor} intensity={0.5} distance={5} />
        </group>
      ))}
    </group>
  );
};

// Landing pad
const LandingPad = ({ onInteract }: { onInteract: () => void }) => {
  const padRef = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (padRef.current) {
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      padRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={padRef} position={[0, 0.1, 0]}>
      {/* Main pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#333344" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Landing lights */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 4.5;
        const z = Math.sin(angle) * 4.5;
        return (
          <group key={i} position={[x, 0.2, z]}>
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="#00ff88" />
            </mesh>
            <pointLight color="#00ff88" intensity={0.3} distance={3} />
          </group>
        );
      })}

      {/* Center beacon */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
        <meshStandardMaterial color="#444455" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#00ffaa" />
      </mesh>
      <pointLight position={[0, 4.5, 0]} color="#00ffaa" intensity={2} distance={20} />

      {/* Takeoff zone indicator */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.3, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// Player character on surface
interface SurfacePlayerProps {
  vehicle: "rocket" | "astronaut";
  padPosition: THREE.Vector3;
  onReachPad: () => void;
}

const SurfacePlayer = ({ vehicle, padPosition, onReachPad }: SurfacePlayerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(10, 1, 10));
  const velocityRef = useRef(new THREE.Vector3());
  const rotationRef = useRef(0);
  const isGrounded = useRef(true);
  const keys = useSurfaceControls();

  useFrame((state, delta) => {
    const speed = 8;
    const jumpForce = 8;
    const gravity = 20;
    const friction = 0.9;

    // Movement
    const moveDir = new THREE.Vector3();
    if (keys.current.forward) moveDir.z -= 1;
    if (keys.current.backward) moveDir.z += 1;
    if (keys.current.left) moveDir.x -= 1;
    if (keys.current.right) moveDir.x += 1;

    if (moveDir.length() > 0) {
      moveDir.normalize();
      rotationRef.current = Math.atan2(moveDir.x, moveDir.z);
      velocityRef.current.x = moveDir.x * speed;
      velocityRef.current.z = moveDir.z * speed;
    } else {
      velocityRef.current.x *= friction;
      velocityRef.current.z *= friction;
    }

    // Jump
    if (keys.current.jump && isGrounded.current) {
      velocityRef.current.y = jumpForce;
      isGrounded.current = false;
    }

    // Gravity
    velocityRef.current.y -= gravity * delta;

    // Apply velocity
    positionRef.current.add(velocityRef.current.clone().multiplyScalar(delta));

    // Ground collision (simple)
    if (positionRef.current.y < 1) {
      positionRef.current.y = 1;
      velocityRef.current.y = 0;
      isGrounded.current = true;
    }

    // Check if near landing pad
    const distToPad = new THREE.Vector2(
      positionRef.current.x - padPosition.x,
      positionRef.current.z - padPosition.z
    ).length();
    
    if (distToPad < 5) {
      onReachPad();
    }

    // Update mesh
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.rotation.y = rotationRef.current;
    }
  });

  if (vehicle === "astronaut") {
    return (
      <group ref={groupRef} scale={1.5}>
        {/* Astronaut body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Helmet */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.8} transparent opacity={0.8} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0.7, 0.2]}>
          <sphereGeometry args={[0.2, 16, 16, 0, Math.PI]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[0.5, 0.7, 0.25]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  // Rocket (standing on landing gear)
  return (
    <group ref={groupRef} scale={1.2}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 2.5, 16]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.5 + 1.25, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
        <meshStandardMaterial color="#ff3333" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.6 + 1.25, 0]}>
        <coneGeometry args={[0.4, 1, 16]} />
        <meshStandardMaterial color="#ff3333" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Landing legs */}
      {[0, 120, 240].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin((angle * Math.PI) / 180) * 0.8, 0.3, Math.cos((angle * Math.PI) / 180) * 0.8]}
          rotation={[0.3, (angle * Math.PI) / 180, 0]}
        >
          <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Follow camera for surface
const SurfaceCamera = ({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) => {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3(10, 8, 20));

  useFrame(() => {
    const target = targetRef.current || new THREE.Vector3(10, 1, 10);
    const idealPos = new THREE.Vector3(target.x, target.y + 8, target.z + 15);
    
    smoothPos.current.lerp(idealPos, 0.05);
    camera.position.copy(smoothPos.current);
    camera.lookAt(target.x, target.y + 1, target.z);
  });

  return null;
};

// Main surface scene
interface SurfaceSceneProps {
  planet: PlanetData;
  vehicle: "rocket" | "astronaut";
  onShowTakeoff: (show: boolean) => void;
}

const SurfaceScene = ({ planet, vehicle, onShowTakeoff }: SurfaceSceneProps) => {
  const playerPosRef = useRef(new THREE.Vector3(10, 1, 10));
  const padPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const handleReachPad = useCallback(() => {
    onShowTakeoff(true);
  }, [onShowTakeoff]);

  // Get sky color based on planet
  const getSkyParams = () => {
    const hue = new THREE.Color(planet.color).getHSL({ h: 0, s: 0, l: 0 }).h;
    return {
      sunPosition: [100, 20, 100] as [number, number, number],
      turbidity: 8,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
    };
  };

  const skyParams = getSkyParams();

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={[planet.color, "#333333", 0.3]} />

      <Sky {...skyParams} />

      <Terrain planetColor={planet.color} />
      <Rocks planetColor={planet.color} />
      <Crystals planetColor={planet.color} />
      <LandingPad onInteract={() => {}} />
      
      <SurfacePlayer
        vehicle={vehicle}
        padPosition={padPosition}
        onReachPad={handleReachPad}
      />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={[planet.glowColor, 30, 150]} />
    </>
  );
};

// Landing transition
const LandingTransition = ({ planet, onComplete }: { planet: PlanetData; onComplete: () => void }) => {
  const [phase, setPhase] = useState<"descending" | "landed">("descending");

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("landed"), 2000);
    const timer2 = setTimeout(() => onComplete(), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Atmosphere burn effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${planet.color}88 0%, ${planet.color}44 50%, transparent 70%)`,
        }}
        animate={{
          scale: phase === "descending" ? [1, 1.5, 2] : 2,
          opacity: phase === "descending" ? [0.8, 0.6, 0] : 0,
        }}
        transition={{ duration: 2 }}
      />

      {/* Streaking lines */}
      {phase === "descending" && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                background: `linear-gradient(90deg, transparent, ${planet.color}, white)`,
              }}
              initial={{ x: 200, y: -200, opacity: 0 }}
              animate={{ x: -400, y: 400, opacity: [0, 1, 0] }}
              transition={{
                duration: 0.8,
                delay: Math.random() * 1.5,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Landing text */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h2
          className="text-5xl font-bold text-white mb-4"
          style={{ textShadow: `0 0 30px ${planet.color}` }}
        >
          {phase === "descending" ? "ENTERING ATMOSPHERE" : "LANDED"}
        </motion.h2>
        <p className="text-xl text-white/80">{planet.name}</p>
      </motion.div>

      {/* Flash on land */}
      {phase === "landed" && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
};

// Main component
const PlanetSurface = ({ planet, vehicle, onTakeoff }: PlanetSurfaceProps) => {
  const [showLanding, setShowLanding] = useState(true);
  const [showTakeoffButton, setShowTakeoffButton] = useState(false);
  const [isTakingOff, setIsTakingOff] = useState(false);

  const handleLandingComplete = useCallback(() => {
    setShowLanding(false);
  }, []);

  const handleTakeoff = useCallback(() => {
    setIsTakingOff(true);
    setTimeout(() => onTakeoff(), 1500);
  }, [onTakeoff]);

  return (
    <div className="w-full h-full absolute inset-0">
      {/* Landing transition */}
      <AnimatePresence>
        {showLanding && (
          <LandingTransition planet={planet} onComplete={handleLandingComplete} />
        )}
      </AnimatePresence>

      {/* Takeoff transition */}
      <AnimatePresence>
        {isTakingOff && (
          <motion.div
            className="absolute inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [10, 8, 20], fov: 60 }}>
        <Suspense fallback={null}>
          <SurfaceScene planet={planet} vehicle={vehicle} onShowTakeoff={setShowTakeoffButton} />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="backdrop-blur-md rounded-xl px-5 py-4 border shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${planet.color}33, transparent)`,
            borderColor: `${planet.color}55`,
          }}
        >
          <h2 className="text-foreground text-2xl font-bold mb-1">{planet.name}</h2>
          <p className="text-muted-foreground text-sm">{planet.description}</p>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-6 left-6 pointer-events-none"
      >
        <div className="bg-background/80 backdrop-blur-md rounded-xl px-5 py-4 border border-border/30 shadow-lg">
          <p className="text-foreground text-sm font-medium mb-2">Surface Controls</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>W/A/S/D</span><span>Move</span>
            <span>Space</span><span>Jump</span>
          </div>
          <p className="text-accent text-xs mt-3">Walk to the landing pad to take off</p>
        </div>
      </motion.div>

      {/* Takeoff button */}
      <AnimatePresence>
        {showTakeoffButton && !isTakingOff && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-6 right-6"
          >
            <button
              onClick={handleTakeoff}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${planet.color}, ${planet.glowColor})`,
                color: "#000",
                boxShadow: `0 0 30px ${planet.color}88`,
              }}
            >
              🚀 TAKE OFF
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass / direction indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute top-6 right-6 pointer-events-none"
      >
        <div className="bg-background/60 backdrop-blur-md rounded-full w-20 h-20 border border-border/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">PAD</div>
            <div className="text-lg">⬇️</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanetSurface;
