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
      {/* Planet ring */}
      {size > 4 && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[size * 1.05, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// Player vehicle
const PlayerVehicle = ({ 
  vehicle, 
  targetPosition 
}: { 
  vehicle: "rocket" | "astronaut";
  targetPosition: React.MutableRefObject<{ x: number; y: number }>;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Smooth follow mouse
      const targetX = targetPosition.current.x * 8;
      const targetY = targetPosition.current.y * 5;
      
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
      
      // Tilt based on movement
      groupRef.current.rotation.z = -targetPosition.current.x * 0.3;
      groupRef.current.rotation.x = targetPosition.current.y * 0.2;

      // Camera follows slightly
      camera.position.x += (targetX * 0.3 - camera.position.x) * 0.05;
      camera.position.y += (targetY * 0.3 + 2 - camera.position.y) * 0.05;
      camera.lookAt(groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z - 5);
    }
  });

  if (vehicle === "rocket") {
    return (
      <group ref={groupRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Rocket body */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 16]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Fins */}
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
        {/* Engine flame */}
        <mesh position={[0, -1, 0]}>
          <coneGeometry args={[0.2, 0.8, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, -1, 0]} color="#ff6600" intensity={3} distance={5} />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Astronaut helmet */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.45, 0.25]}>
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffaa00" metalness={1} roughness={0.05} />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.25, 0.4, 8, 16]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Jetpack */}
      <mesh position={[0, -0.1, -0.3]}>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Jetpack flames */}
      <mesh position={[-0.1, -0.45, -0.35]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshBasicMaterial color="#66ddff" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.1, -0.45, -0.35]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <meshBasicMaterial color="#66ddff" transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, -0.5, -0.35]} color="#66ddff" intensity={2} distance={4} />
    </group>
  );
};

// Moving space environment
const SpaceEnvironment = ({ speed }: { speed: number }) => {
  const asteroidsRef = useRef<THREE.Group>(null);
  
  // Generate random asteroids
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

  const collectibles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
        -Math.random() * 150 - 30,
      ] as [number, number, number],
    }))
  ).current;

  useFrame(() => {
    if (asteroidsRef.current) {
      asteroidsRef.current.position.z += speed;
      
      // Reset position when asteroids pass
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
  speed 
}: { 
  vehicle: "rocket" | "astronaut";
  onCollect: () => void;
  speed: number;
}) => {
  const targetPosition = useRef({ x: 0, y: 0 });
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetPosition.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

      {/* Distant planets */}
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

      <PlayerVehicle vehicle={vehicle} targetPosition={targetPosition} />

      {/* Nebula fog effect */}
      <fog attach="fog" args={["#0a0a1a", 50, 200]} />
    </>
  );
};

const SpaceExploration = ({ vehicle }: SpaceExplorationProps) => {
  const [score, setScore] = useState(0);
  const [speed] = useState(0.15);

  const handleCollect = useCallback(() => {
    setScore(prev => prev + 100);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 2, 10], fov: 70 }}>
        <Suspense fallback={null}>
          <Scene vehicle={vehicle} onCollect={handleCollect} speed={speed} />
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
          <p className="text-muted-foreground text-sm text-center">
            Move your mouse to navigate • Collect ⭐ stars for points
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpaceExploration;