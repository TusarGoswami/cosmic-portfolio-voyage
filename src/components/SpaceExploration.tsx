import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

interface SpaceExplorationProps {
  vehicle: "rocket" | "astronaut";
}

// Asteroid component
const Asteroid = ({ position, size }: { position: [number, number, number]; size: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationSpeed = useRef({
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02,
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#5a5a6a"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

// Collectible star
const CollectibleStar = ({ 
  position, 
  onCollect,
  id 
}: { 
  position: [number, number, number]; 
  onCollect: (id: number) => void;
  id: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  if (collected) return null;

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onClick={() => {
        setCollected(true);
        onCollect(id);
      }}
    >
      <octahedronGeometry args={[0.4, 0]} />
      <meshBasicMaterial color="#ffdd00" transparent opacity={0.9} />
      <pointLight color="#ffdd00" intensity={2} distance={5} />
    </mesh>
  );
};

// Planet
const Planet = ({ position, size, color }: { position: [number, number, number]; size: number; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
      </mesh>
      {size > 4 && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// Animated Astronaut with walking animation
const AnimatedAstronaut = ({ 
  isMoving,
  moveDirection 
}: { 
  isMoving: boolean;
  moveDirection: { x: number; z: number };
}) => {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const walkSpeed = 8;
    const walkAmplitude = isMoving ? 0.4 : 0;
    const bobAmplitude = isMoving ? 0.05 : 0;

    // Walking animation
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmplitude;
      rightLegRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * walkAmplitude;
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * walkAmplitude * 0.7;
      rightArmRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmplitude * 0.7;
    }

    // Body bobbing
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(time * walkSpeed * 2)) * bobAmplitude;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Helmet */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.95, 0.3]}>
        <sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffaa00" metalness={1} roughness={0.05} />
      </mesh>
      {/* Helmet rim */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.35, 0.05, 8, 32]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.3, 0.4, 8, 16]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Chest panel */}
      <mesh position={[0, 0.3, 0.28]}>
        <boxGeometry args={[0.25, 0.3, 0.06]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.06, 0.38, 0.32]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <mesh position={[0.06, 0.38, 0.32]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Backpack */}
      <mesh position={[0, 0.15, -0.35]}>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Jetpack thrusters */}
      <mesh position={[-0.12, -0.15, -0.42]}>
        <cylinderGeometry args={[0.05, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.12, -0.15, -0.42]}>
        <cylinderGeometry args={[0.05, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Jetpack flames when moving */}
      {isMoving && (
        <>
          <mesh position={[-0.12, -0.28, -0.42]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.04, 0.25, 8]} />
            <meshBasicMaterial color="#66ddff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.12, -0.28, -0.42]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.04, 0.25, 8]} />
            <meshBasicMaterial color="#66ddff" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, -0.3, -0.42]} color="#66ddff" intensity={2} distance={3} />
        </>
      )}

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.42, 0.3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <capsuleGeometry args={[0.1, 0.25, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[-0.18, -0.15, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff6600" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.42, 0.3, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.1, 0.25, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0.18, -0.15, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff6600" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, -0.25, 0]}>
        <mesh>
          <capsuleGeometry args={[0.1, 0.35, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.35, 0.03]}>
          <boxGeometry args={[0.12, 0.12, 0.2]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, -0.25, 0]}>
        <mesh>
          <capsuleGeometry args={[0.1, 0.35, 8, 8]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.35, 0.03]}>
          <boxGeometry args={[0.12, 0.12, 0.2]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// Player vehicle with WASD controls
const PlayerVehicle = ({ 
  vehicle, 
  keys,
}: { 
  vehicle: "rocket" | "astronaut";
  keys: React.MutableRefObject<{ w: boolean; a: boolean; s: boolean; d: boolean }>;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const velocity = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [moveDirection, setMoveDirection] = useState({ x: 0, z: 0 });

  useFrame(() => {
    if (groupRef.current) {
      const acceleration = 0.015;
      const friction = 0.92;
      const maxSpeed = 0.25;

      // Apply acceleration based on keys
      if (keys.current.w) velocity.current.y += acceleration;
      if (keys.current.s) velocity.current.y -= acceleration;
      if (keys.current.a) velocity.current.x -= acceleration;
      if (keys.current.d) velocity.current.x += acceleration;

      // Apply friction
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      // Clamp velocity
      velocity.current.x = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.x));
      velocity.current.y = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.y));

      // Update position
      position.current.x += velocity.current.x;
      position.current.y += velocity.current.y;

      // Clamp position
      position.current.x = Math.max(-10, Math.min(10, position.current.x));
      position.current.y = Math.max(-6, Math.min(6, position.current.y));

      // Apply to group
      groupRef.current.position.x = position.current.x;
      groupRef.current.position.y = position.current.y;

      // Tilt based on velocity
      const tiltAmount = vehicle === "rocket" ? 0.5 : 0.2;
      groupRef.current.rotation.z = -velocity.current.x * tiltAmount * 5;
      groupRef.current.rotation.x = velocity.current.y * tiltAmount * 3;

      // Face movement direction for astronaut
      if (vehicle === "astronaut" && (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01)) {
        const targetRotation = Math.atan2(-velocity.current.x, 0);
        groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1;
      }

      // Update movement state
      const moving = Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01;
      setIsMoving(moving);
      setMoveDirection({ x: velocity.current.x, z: velocity.current.y });

      // Camera follows
      camera.position.x += (position.current.x * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (position.current.y * 0.3 + 2 - camera.position.y) * 0.05;
      camera.lookAt(groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z - 5);
    }
  });

  if (vehicle === "rocket") {
    return (
      <group ref={groupRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 16]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.7} roughness={0.3} />
        </mesh>
        {[0, 90, 180, 270].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.35,
              -0.5,
              Math.sin((angle * Math.PI) / 180) * 0.35,
            ]}
            rotation={[0, (-angle * Math.PI) / 180, 0.2]}
          >
            <boxGeometry args={[0.15, 0.4, 0.03]} />
            <meshStandardMaterial color="#3366cc" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[0.2, isMoving ? 1 : 0.6, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -1.2, 0]}>
          <coneGeometry args={[0.1, isMoving ? 0.6 : 0.3, 16]} />
          <meshBasicMaterial color="#ffff66" transparent opacity={0.9} />
        </mesh>
        <pointLight position={[0, -1, 0]} color="#ff6600" intensity={isMoving ? 5 : 3} distance={5} />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <AnimatedAstronaut isMoving={isMoving} moveDirection={moveDirection} />
    </group>
  );
};

// Moving space environment
const SpaceEnvironment = ({ speed }: { speed: number }) => {
  const asteroidsRef = useRef<THREE.Group>(null);
  
  const asteroids = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        -Math.random() * 200 - 20,
      ] as [number, number, number],
      size: Math.random() * 1.5 + 0.5,
    }))
  ).current;

  useFrame(() => {
    if (asteroidsRef.current) {
      asteroidsRef.current.position.z += speed;
      if (asteroidsRef.current.position.z > 50) {
        asteroidsRef.current.position.z = 0;
      }
    }
  });

  return (
    <group ref={asteroidsRef}>
      {asteroids.map((asteroid) => (
        <Asteroid key={asteroid.id} position={asteroid.position} size={asteroid.size} />
      ))}
    </group>
  );
};

// Main scene
const Scene = ({ 
  vehicle, 
  onCollect,
  speed,
  keys 
}: { 
  vehicle: "rocket" | "astronaut";
  onCollect: () => void;
  speed: number;
  keys: React.MutableRefObject<{ w: boolean; a: boolean; s: boolean; d: boolean }>;
}) => {
  const collectiblesGroupRef = useRef<THREE.Group>(null);
  const [collectedIds, setCollectedIds] = useState<number[]>([]);

  const collectibles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 12,
        -Math.random() * 180 - 40,
      ] as [number, number, number],
    }))
  ).current;

  useFrame(() => {
    if (collectiblesGroupRef.current) {
      collectiblesGroupRef.current.position.z += speed;
      if (collectiblesGroupRef.current.position.z > 60) {
        collectiblesGroupRef.current.position.z = 0;
      }
    }
  });

  const handleCollect = useCallback((id: number) => {
    if (!collectedIds.includes(id)) {
      setCollectedIds(prev => [...prev, id]);
      onCollect();
    }
  }, [collectedIds, onCollect]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#4fc3f7" />

      <Stars radius={200} depth={100} count={8000} factor={4} saturation={0} fade speed={2} />

      <Planet position={[-50, 20, -150]} size={8} color="#ff6644" />
      <Planet position={[60, -15, -200]} size={12} color="#4488ff" />
      <Planet position={[0, 40, -180]} size={5} color="#44ff88" />

      <SpaceEnvironment speed={speed} />

      <group ref={collectiblesGroupRef}>
        {collectibles.map((c) => (
          !collectedIds.includes(c.id) && (
            <CollectibleStar 
              key={c.id} 
              id={c.id}
              position={c.position} 
              onCollect={handleCollect}
            />
          )
        ))}
      </group>

      <PlayerVehicle vehicle={vehicle} keys={keys} />

      <fog attach="fog" args={["#0a0a1a", 50, 200]} />
    </>
  );
};

const SpaceExploration = ({ vehicle }: SpaceExplorationProps) => {
  const [score, setScore] = useState(0);
  const [speed] = useState(0.15);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w") keys.current.w = true;
      if (key === "a") keys.current.a = true;
      if (key === "s") keys.current.s = true;
      if (key === "d") keys.current.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w") keys.current.w = false;
      if (key === "a") keys.current.a = false;
      if (key === "s") keys.current.s = false;
      if (key === "d") keys.current.d = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleCollect = useCallback(() => {
    setScore(prev => prev + 100);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 2, 10], fov: 70 }}>
        <Suspense fallback={null}>
          <Scene vehicle={vehicle} onCollect={handleCollect} speed={speed} keys={keys} />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
          <p className="text-muted-foreground text-sm">Vehicle</p>
          <p className="text-foreground text-lg font-bold">
            {vehicle === "rocket" ? "🚀 Rocket" : "🧑‍🚀 Astronaut"}
          </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
          <p className="text-muted-foreground text-sm">Score</p>
          <p className="text-foreground text-2xl font-bold text-accent">{score}</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/30">
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <span className="bg-background/80 px-2 py-1 rounded text-xs font-mono">W</span>
              </div>
              <div className="flex gap-1">
                <span className="bg-background/80 px-2 py-1 rounded text-xs font-mono">A</span>
                <span className="bg-background/80 px-2 py-1 rounded text-xs font-mono">S</span>
                <span className="bg-background/80 px-2 py-1 rounded text-xs font-mono">D</span>
              </div>
            </div>
            <span>to move • Collect ⭐ stars for points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceExploration;