import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

interface GalaxyExplorationProps {
  vehicle: "rocket" | "astronaut";
}

interface PlanetData {
  id: number;
  name: string;
  orbitRadius: number;
  size: number;
  color: string;
  orbitSpeed: number;
  rotationSpeed: number;
  spotColor: string;
  glowColor: string;
  hasRing?: boolean;
  ringColor?: string;
  hasSatellite?: boolean;
  initialAngle: number;
  description: string;
  facts: string[];
  moons: number;
  gravityRadius: number;
  orbitCaptureRadius: number;
}

const PLANETS_DATA: PlanetData[] = [
  { 
    id: 0, name: "Pyralis", orbitRadius: 22, size: 2, color: "#ff7755", orbitSpeed: 0.25, rotationSpeed: 1.8, 
    spotColor: "#ffaa88", glowColor: "#ff9966", hasSatellite: true, initialAngle: 0,
    description: "A volcanic world with rivers of molten lava and intense heat.",
    facts: ["Orbital period: 88 days", "Surface temp: 450°C", "Volcanic activity: Extreme"],
    moons: 1, gravityRadius: 12, orbitCaptureRadius: 6
  },
  { 
    id: 1, name: "Aquaris", orbitRadius: 32, size: 2.8, color: "#55aaff", orbitSpeed: 0.18, rotationSpeed: 1.4, 
    spotColor: "#88ccff", glowColor: "#77bbff", hasRing: true, ringColor: "#8899bb", initialAngle: Math.PI * 0.5,
    description: "An ocean world with crystalline ice rings and deep underwater cities.",
    facts: ["Orbital period: 210 days", "97% water surface", "Ring composition: Ice crystals"],
    moons: 3, gravityRadius: 15, orbitCaptureRadius: 7
  },
  { 
    id: 2, name: "Verdania", orbitRadius: 44, size: 2.5, color: "#66ff88", orbitSpeed: 0.22, rotationSpeed: 2.5, 
    spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI,
    description: "A lush paradise planet covered in bioluminescent forests.",
    facts: ["Orbital period: 365 days", "85% forest coverage", "Biodiversity: Extreme"],
    moons: 2, gravityRadius: 14, orbitCaptureRadius: 6.5
  },
  { 
    id: 3, name: "Solarius", orbitRadius: 58, size: 5, color: "#ffbb55", orbitSpeed: 0.08, rotationSpeed: 0.6, 
    spotColor: "#ffdd88", glowColor: "#ffcc66", hasRing: true, ringColor: "#ddaa66", hasSatellite: true, initialAngle: Math.PI * 1.3,
    description: "The golden giant with massive storms and floating cloud cities.",
    facts: ["Orbital period: 12 years", "Great Storm: 400 years old", "Atmosphere: Metallic hydrogen"],
    moons: 67, gravityRadius: 25, orbitCaptureRadius: 12
  },
  { 
    id: 4, name: "Nebulora", orbitRadius: 75, size: 4, color: "#bb77ff", orbitSpeed: 0.06, rotationSpeed: 0.8, 
    spotColor: "#dd99ff", glowColor: "#cc88ff", hasSatellite: true, initialAngle: Math.PI * 0.7,
    description: "A mystical purple world surrounded by cosmic dust clouds.",
    facts: ["Orbital period: 30 years", "Nebula density: High", "Magnetic field: Extreme"],
    moons: 24, gravityRadius: 20, orbitCaptureRadius: 10
  },
  { 
    id: 5, name: "Rosaria", orbitRadius: 92, size: 2.2, color: "#ff77aa", orbitSpeed: 0.12, rotationSpeed: 1.5, 
    spotColor: "#ff99cc", glowColor: "#ff88bb", initialAngle: Math.PI * 1.8,
    description: "The rose planet known for its crystalline pink deserts.",
    facts: ["Orbital period: 15 years", "Crystal formations: Abundant", "Surface: Silicon dioxide"],
    moons: 0, gravityRadius: 12, orbitCaptureRadius: 6
  },
  { 
    id: 6, name: "Cryonia", orbitRadius: 110, size: 4.5, color: "#77ffff", orbitSpeed: 0.04, rotationSpeed: 0.5, 
    spotColor: "#99ffff", glowColor: "#88ffff", hasRing: true, ringColor: "#66cccc", hasSatellite: true, initialAngle: Math.PI * 0.3,
    description: "An ice giant at the edge of the system with aurora displays.",
    facts: ["Orbital period: 84 years", "Surface temp: -224°C", "Aurora frequency: Constant"],
    moons: 42, gravityRadius: 22, orbitCaptureRadius: 11
  },
];

// Keyboard state - global singleton to avoid event conflicts
const keyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

// Setup keyboard listeners once
let listenersSetup = false;
const setupKeyboardListeners = () => {
  if (listenersSetup) return;
  listenersSetup = true;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code;
    
    // Prevent default browser behavior for game controls
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
        key === ' ' || key === 'shift' ||
        code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight' ||
        code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      e.preventDefault();
    }
    
    if (key === "w" || code === "ArrowUp") keyState.forward = true;
    if (key === "s" || code === "ArrowDown") keyState.backward = true;
    if (key === "a" || code === "ArrowLeft") keyState.left = true;
    if (key === "d" || code === "ArrowRight") keyState.right = true;
    if (key === " " || code === "Space") keyState.up = true;
    if (key === "shift" || code === "ShiftLeft" || code === "ShiftRight") keyState.down = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code;
    
    if (key === "w" || code === "ArrowUp") keyState.forward = false;
    if (key === "s" || code === "ArrowDown") keyState.backward = false;
    if (key === "a" || code === "ArrowLeft") keyState.left = false;
    if (key === "d" || code === "ArrowRight") keyState.right = false;
    if (key === " " || code === "Space") keyState.up = false;
    if (key === "shift" || code === "ShiftLeft" || code === "ShiftRight") keyState.down = false;
  };

  document.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("keyup", handleKeyUp, { capture: true });
};

const useKeyboardControls = () => {
  useEffect(() => {
    setupKeyboardListeners();
  }, []);

  return { current: keyState };
};

// Blinking Stars Background
const BlinkingStars = ({ count = 4000 }: { count?: number }) => {
  const starsRef = useRef<THREE.Points>(null);
  
  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const starColors = [
      [1, 1, 1],
      [1, 0.9, 0.8],
      [0.8, 0.9, 1],
      [1, 0.8, 0.6],
      [0.9, 0.95, 1],
    ];
    
    for (let i = 0; i < count; i++) {
      const radius = 150 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 3 + 1;
      phases[i] = Math.random() * Math.PI * 2;
      
      const colorIdx = Math.floor(Math.random() * starColors.length);
      colors[i * 3] = starColors[colorIdx][0];
      colors[i * 3 + 1] = starColors[colorIdx][1];
      colors[i * 3 + 2] = starColors[colorIdx][2];
    }
    
    return { positions, sizes, phases, colors };
  }, [count]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      const sizesAttr = starsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        const blink = Math.sin(time * (0.5 + (i % 10) * 0.1) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.4 + blink * 0.6);
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
        size={2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(1 + Math.sin(time * 2 + 1) * 0.05);
      glow2Ref.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>
      
      <mesh ref={glowRef}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>
      
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[10.5, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[13, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.08} />
      </mesh>
      
      <pointLight color="#ffdd44" intensity={5} distance={200} />
      <pointLight color="#ff8800" intensity={2} distance={100} />
    </group>
  );
};

// Orbital Path
const OrbitalPath = ({ radius, color = "#ffffff" }: { radius: number; color?: string }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.25}
    />
  );
};

// Satellite orbiting a planet
const Satellite = ({ orbitRadius, speed, size = 0.3 }: { orbitRadius: number; speed: number; size?: number }) => {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime * speed;
      satelliteRef.current.position.x = Math.cos(time) * orbitRadius;
      satelliteRef.current.position.z = Math.sin(time) * orbitRadius;
      satelliteRef.current.position.y = Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      <pointLight color="#ffffff" intensity={0.5} distance={4} />
    </group>
  );
};

// Planet Component
interface PlanetProps {
  planet: PlanetData;
  getPlanetPosition: (planet: PlanetData, time: number) => THREE.Vector3;
}

const Planet = ({ planet, getPlanetPosition }: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const spotTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(0.3, planet.spotColor || planet.color);
      gradient.addColorStop(0.7, planet.color);
      gradient.addColorStop(1, planet.spotColor || planet.color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      ctx.fillStyle = planet.spotColor || "rgba(255,255,255,0.25)";
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 15;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 8;
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 40 + Math.random() * 15;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + 10, 384, y - 10, 512, y);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [planet.color, planet.spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pos = getPlanetPosition(planet, time);
    
    if (groupRef.current) {
      groupRef.current.position.copy(pos);
    }
    
    if (planetRef.current) {
      planetRef.current.rotation.y = time * planet.rotationSpeed;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * planet.rotationSpeed * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial 
          map={spotTexture}
          emissive={planet.color}
          emissiveIntensity={0.15}
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>
      
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size * 1.05, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.2} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.1} />
      </mesh>
      
      {planet.hasRing && (
        <>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 1.5, planet.size * 2.2, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 2.2, planet.size * 2.5, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      
      {planet.hasSatellite && (
        <Satellite orbitRadius={planet.size * 2.5} speed={1.5} size={planet.size * 0.2} />
      )}
      
      <pointLight color={planet.color} intensity={0.3} distance={planet.size * 5} />
    </group>
  );
};

// Asteroid Belt
interface AsteroidBeltProps {
  innerRadius: number;
  outerRadius: number;
  count: number;
  shipPosition: THREE.Vector3;
  onCollision: () => void;
}

const AsteroidBelt = ({ innerRadius, outerRadius, count, shipPosition, onCollision }: AsteroidBeltProps) => {
  const asteroidsRef = useRef<THREE.InstancedMesh>(null);
  const asteroidData = useRef<{ position: THREE.Vector3; rotation: THREE.Euler; speed: number; size: number }[]>([]);
  
  useMemo(() => {
    asteroidData.current = [];
    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6;
      
      asteroidData.current.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        speed: 0.02 + Math.random() * 0.05,
        size: 0.3 + Math.random() * 0.7,
      });
    }
  }, [innerRadius, outerRadius, count]);

  useFrame((state) => {
    if (!asteroidsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    asteroidData.current.forEach((asteroid, i) => {
      const angle = Math.atan2(asteroid.position.z, asteroid.position.x) + time * asteroid.speed;
      const radius = Math.sqrt(asteroid.position.x ** 2 + asteroid.position.z ** 2);
      
      position.set(
        Math.cos(angle) * radius,
        asteroid.position.y + Math.sin(time * 2 + i) * 0.3,
        Math.sin(angle) * radius
      );
      
      quaternion.setFromEuler(new THREE.Euler(
        asteroid.rotation.x + time * asteroid.speed * 2,
        asteroid.rotation.y + time * asteroid.speed,
        asteroid.rotation.z + time * asteroid.speed * 1.5
      ));
      
      scale.setScalar(asteroid.size);
      
      matrix.compose(position, quaternion, scale);
      asteroidsRef.current!.setMatrixAt(i, matrix);
      
      // Collision detection with ship
      const distance = position.distanceTo(shipPosition);
      if (distance < asteroid.size + 1) {
        onCollision();
      }
    });
    
    asteroidsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={asteroidsRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8b7355" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
};

// Spaceship Component
interface SpaceshipProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  isOrbiting: boolean;
  orbitingPlanet: PlanetData | null;
  vehicle: "rocket" | "astronaut";
}

const Spaceship = ({ position, rotation, velocity, isOrbiting, vehicle }: SpaceshipProps) => {
  const shipRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Mesh>(null);
  
  const speed = velocity.length();

  useFrame((state) => {
    if (exhaustRef.current) {
      const scale = 0.5 + speed * 2;
      exhaustRef.current.scale.set(1, scale, 1);
      const flicker = Math.sin(state.clock.elapsedTime * 20) * 0.2 + 0.8;
      (exhaustRef.current.material as THREE.MeshBasicMaterial).opacity = speed > 0.01 ? flicker * 0.8 : 0;
    }
  });

  if (vehicle === "astronaut") {
    return (
      <group ref={shipRef} position={position} rotation={rotation} scale={2}>
        {/* Astronaut body */}
        <mesh>
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
        {/* Jetpack */}
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[0.5, 0.7, 0.25]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Jetpack thrusters */}
        <mesh position={[-0.15, -0.4, -0.35]}>
          <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
        <mesh position={[0.15, -0.4, -0.35]}>
          <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.5, 0.1, 0]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.12, 0.4, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.12, 0.4, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.2, -0.7, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.2, -0.7, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Jetpack exhaust flames */}
        <mesh ref={exhaustRef} position={[-0.15, -0.6, -0.35]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.6, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.15, -0.6, -0.35]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.6, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={speed > 0.01 ? 0.8 : 0} />
        </mesh>
        <pointLight color="#ffaa00" intensity={speed * 3} distance={8} position={[0, -0.8, -0.3]} />
      </group>
    );
  }

  return (
    <group ref={shipRef} position={position} rotation={rotation} scale={2}>
      {/* Rocket body */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.6, 2.5, 16]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
        <meshStandardMaterial color="#ff3333" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Blue stripe */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.2, 16]} />
        <meshStandardMaterial color="#3366ff" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.4, 1, 16]} />
        <meshStandardMaterial color="#ff3333" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 0.7, 0.38]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#66ccff" />
      </mesh>
      <mesh position={[0, 0.7, 0.36]}>
        <ringGeometry args={[0.13, 0.17, 16]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
      {/* Fins - 4 fins */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh key={i} position={[Math.sin(angle * Math.PI / 180) * 0.55, -1, Math.cos(angle * Math.PI / 180) * 0.55]} rotation={[0.2, -angle * Math.PI / 180, 0]}>
          <boxGeometry args={[0.15, 0.7, 0.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ff3333" : "#3366ff"} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Engine nozzle */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Exhaust flame */}
      <mesh ref={exhaustRef} position={[0, -1.8, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1.2, 16]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.8, 16]} />
        <meshBasicMaterial color="#ffff66" transparent opacity={speed > 0.01 ? 0.9 : 0} />
      </mesh>
      <pointLight color="#ffaa00" intensity={speed * 4} distance={12} position={[0, -2, 0]} />
    </group>
  );
};

// Camera that follows the ship - TRUE third person view
interface FollowCameraProps {
  shipPositionRef: React.MutableRefObject<THREE.Vector3>;
  shipRotationRef: React.MutableRefObject<THREE.Euler>;
  isOrbiting: boolean;
}

const FollowCamera = ({ shipPositionRef, shipRotationRef, isOrbiting }: FollowCameraProps) => {
  const { camera } = useThree();
  const smoothCameraPos = useRef(new THREE.Vector3(30, 10, 40));
  const smoothLookAt = useRef(new THREE.Vector3(30, 5, 30));
  const initialized = useRef(false);

  useFrame(() => {
    // Read current values from refs (always up-to-date)
    const shipPos = shipPositionRef.current;
    const shipRot = shipRotationRef.current;
    
    // Camera offset - behind and above the ship
    const cameraDistance = 18;
    const cameraHeight = 8;
    
    // Calculate camera position based on ship's facing direction (Y rotation)
    const behindOffset = new THREE.Vector3(
      Math.sin(shipRot.y) * cameraDistance,
      cameraHeight,
      Math.cos(shipRot.y) * cameraDistance
    );
    
    // Target camera position is ship position + offset (behind the ship)
    const targetCameraPos = shipPos.clone().add(behindOffset);
    
    // Look at the ship directly
    const targetLookAt = shipPos.clone();
    
    // Initialize camera position immediately on first frame
    if (!initialized.current) {
      smoothCameraPos.current.copy(targetCameraPos);
      smoothLookAt.current.copy(targetLookAt);
      initialized.current = true;
    }
    
    // Smooth camera follow - faster lerp for responsive feel
    const lerpSpeed = isOrbiting ? 0.08 : 0.15;
    smoothCameraPos.current.lerp(targetCameraPos, lerpSpeed);
    smoothLookAt.current.lerp(targetLookAt, lerpSpeed * 1.5);
    
    // Apply camera position and look at
    camera.position.copy(smoothCameraPos.current);
    camera.lookAt(smoothLookAt.current);
  });

  return null;
};

// Main Galaxy Scene
interface GalaxySceneProps {
  vehicle: "rocket" | "astronaut";
  onPlanetApproach: (planet: PlanetData | null) => void;
  onOrbitCapture: (planet: PlanetData | null) => void;
  orbitingPlanet: PlanetData | null;
  showEnterButton: boolean;
  onAsteroidCollision: () => void;
  onShipPositionUpdate: (pos: { x: number; z: number }, time: number) => void;
}

const GalaxyScene = ({ 
  vehicle, 
  onPlanetApproach, 
  onOrbitCapture, 
  orbitingPlanet,
  showEnterButton,
  onAsteroidCollision,
  onShipPositionUpdate
}: GalaxySceneProps) => {
  const keys = useKeyboardControls();
  const shipPosition = useRef(new THREE.Vector3(30, 5, 30));
  const shipVelocity = useRef(new THREE.Vector3());
  const shipRotation = useRef(new THREE.Euler(0, 0, 0));
  const orbitAngle = useRef(0);
  const [, forceUpdate] = useState(0);

  const getPlanetPosition = useCallback((planet: PlanetData, time: number) => {
    const angle = planet.initialAngle + time * planet.orbitSpeed;
    return new THREE.Vector3(
      Math.cos(angle) * planet.orbitRadius,
      Math.sin(angle * 2) * 1,
      Math.sin(angle) * planet.orbitRadius
    );
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const delta = Math.min(state.clock.getDelta(), 0.1);
    
    const acceleration = 0.8;
    const maxSpeed = 2;
    const friction = 0.98;
    const rotationSpeed = 0.03;
    
    // If orbiting, handle orbit mechanics
    if (orbitingPlanet) {
      const planetPos = getPlanetPosition(orbitingPlanet, time);
      const orbitDistance = orbitingPlanet.size + orbitingPlanet.orbitCaptureRadius * 0.6;
      
      // Check for escape input
      const escaping = keys.current.forward || keys.current.backward || keys.current.left || keys.current.right;
      
      if (escaping) {
        // Escape velocity
        const escapeDir = new THREE.Vector3();
        if (keys.current.forward) escapeDir.z -= 1;
        if (keys.current.backward) escapeDir.z += 1;
        if (keys.current.left) escapeDir.x -= 1;
        if (keys.current.right) escapeDir.x += 1;
        escapeDir.normalize().multiplyScalar(maxSpeed * 1.5);
        
        shipVelocity.current.copy(escapeDir);
        shipPosition.current.add(escapeDir.clone().multiplyScalar(delta * 60));
        onOrbitCapture(null);
      } else {
        // Continue orbiting
        orbitAngle.current += 0.02;
        shipPosition.current.set(
          planetPos.x + Math.cos(orbitAngle.current) * orbitDistance,
          planetPos.y + Math.sin(orbitAngle.current * 0.5) * 2,
          planetPos.z + Math.sin(orbitAngle.current) * orbitDistance
        );
        
        // Face the direction of orbit
        const tangent = new THREE.Vector3(
          -Math.sin(orbitAngle.current),
          0,
          Math.cos(orbitAngle.current)
        );
        shipRotation.current.y = Math.atan2(tangent.x, tangent.z);
      }
    } else {
      // Free flight controls
      if (keys.current.left) shipRotation.current.y += rotationSpeed;
      if (keys.current.right) shipRotation.current.y -= rotationSpeed;
      
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyEuler(shipRotation.current);
      
      if (keys.current.forward) {
        shipVelocity.current.add(forward.clone().multiplyScalar(acceleration * delta * 60));
      }
      if (keys.current.backward) {
        shipVelocity.current.add(forward.clone().multiplyScalar(-acceleration * 0.5 * delta * 60));
      }
      if (keys.current.up) {
        shipVelocity.current.y += acceleration * 0.5 * delta * 60;
      }
      if (keys.current.down) {
        shipVelocity.current.y -= acceleration * 0.5 * delta * 60;
      }
      
      // Clamp speed
      if (shipVelocity.current.length() > maxSpeed) {
        shipVelocity.current.normalize().multiplyScalar(maxSpeed);
      }
      
      // Apply friction
      shipVelocity.current.multiplyScalar(friction);
      
      // Check gravity and collision with planets
      let nearestPlanet: PlanetData | null = null;
      let nearestDistance = Infinity;
      
      for (const planet of PLANETS_DATA) {
        const planetPos = getPlanetPosition(planet, time);
        const distance = shipPosition.current.distanceTo(planetPos);
        
        // Invisible wall - can't pass through planet
        if (distance < planet.size + 1) {
          const pushDir = shipPosition.current.clone().sub(planetPos).normalize();
          shipPosition.current.copy(planetPos).add(pushDir.multiplyScalar(planet.size + 1.1));
          shipVelocity.current.reflect(pushDir).multiplyScalar(0.3);
        }
        
        // Gravity attraction
        if (distance < planet.gravityRadius && distance > planet.size) {
          const gravityStrength = (1 - distance / planet.gravityRadius) * 0.015;
          const gravityDir = planetPos.clone().sub(shipPosition.current).normalize();
          shipVelocity.current.add(gravityDir.multiplyScalar(gravityStrength));
          
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlanet = planet;
          }
          
          // Orbit capture
          if (distance < planet.size + planet.orbitCaptureRadius) {
            onOrbitCapture(planet);
            orbitAngle.current = Math.atan2(
              shipPosition.current.z - planetPos.z,
              shipPosition.current.x - planetPos.x
            );
          }
        }
      }
      
      onPlanetApproach(nearestPlanet);
      
      // Apply velocity
      shipPosition.current.add(shipVelocity.current.clone().multiplyScalar(delta * 60));
      
      // Keep ship in bounds
      const maxBound = 140;
      if (shipPosition.current.length() > maxBound) {
        shipPosition.current.normalize().multiplyScalar(maxBound);
        shipVelocity.current.multiplyScalar(-0.5);
      }
      
      // Keep above a minimum height
      if (shipPosition.current.y < -20) {
        shipPosition.current.y = -20;
        shipVelocity.current.y = Math.abs(shipVelocity.current.y) * 0.5;
      }
      if (shipPosition.current.y > 50) {
        shipPosition.current.y = 50;
        shipVelocity.current.y = -Math.abs(shipVelocity.current.y) * 0.5;
      }
    }
    
    // Update ship position for minimap
    onShipPositionUpdate({ x: shipPosition.current.x, z: shipPosition.current.z }, time);
    
    forceUpdate(n => n + 1);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[30, 30, 15]} intensity={0.4} />
      
      <BlinkingStars count={5000} />
      <GalaxyCore />
      
      {/* Orbital paths */}
      {PLANETS_DATA.map((planet) => (
        <OrbitalPath key={`orbit-${planet.id}`} radius={planet.orbitRadius} color={planet.color} />
      ))}
      
      {/* Planets */}
      {PLANETS_DATA.map((planet) => (
        <Planet 
          key={`planet-${planet.id}`} 
          planet={planet}
          getPlanetPosition={getPlanetPosition}
        />
      ))}
      
      {/* Asteroid Belt */}
      <AsteroidBelt 
        innerRadius={48}
        outerRadius={54}
        count={200}
        shipPosition={shipPosition.current}
        onCollision={onAsteroidCollision}
      />
      
      {/* Player Spaceship */}
      <Spaceship 
        position={shipPosition.current}
        rotation={shipRotation.current}
        velocity={shipVelocity.current}
        isOrbiting={orbitingPlanet !== null}
        orbitingPlanet={orbitingPlanet}
        vehicle={vehicle}
      />
      
      {/* Follow Camera */}
      <FollowCamera 
        shipPositionRef={shipPosition}
        shipRotationRef={shipRotation}
        isOrbiting={orbitingPlanet !== null}
      />
      
      {/* Nebula fog */}
      <fog attach="fog" args={["#050510", 80, 300]} />
    </>
  );
};

// Planet Detail Panel
interface PlanetDetailProps {
  planet: PlanetData;
  onClose: () => void;
}

const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50"
    >
      <div className="w-[600px] max-w-[90vw] bg-card/95 backdrop-blur-md rounded-2xl border border-border/30 overflow-hidden shadow-2xl">
        <div
          className="p-8 relative"
          style={{
            background: `linear-gradient(135deg, ${planet.color}44, transparent)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-background/50 hover:bg-background/80 transition-colors text-xl"
          >
            ×
          </button>
          
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-full shadow-lg flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}88)`,
                boxShadow: `0 0 40px ${planet.color}66`,
              }}
            />
            <div>
              <h2 className="text-3xl font-bold text-foreground">{planet.name}</h2>
              <p className="text-muted-foreground mt-2">{planet.description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Size</div>
              <div className="text-foreground text-2xl font-bold">{planet.size.toFixed(1)}x</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Moons</div>
              <div className="text-foreground text-2xl font-bold">{planet.moons}</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Orbit</div>
              <div className="text-foreground text-2xl font-bold">{planet.orbitRadius}AU</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Quick Facts</h3>
            <ul className="space-y-2">
              {planet.facts.map((fact, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: planet.color }}
                  />
                  <span className="text-muted-foreground">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {planet.hasRing && (
              <span className="px-3 py-1.5 text-sm rounded-full bg-accent/20 text-accent border border-accent/30">
                Has Rings
              </span>
            )}
            {planet.moons > 10 && (
              <span className="px-3 py-1.5 text-sm rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Many Moons
              </span>
            )}
            {planet.hasSatellite && (
              <span className="px-3 py-1.5 text-sm rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Satellite
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground font-medium transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const GalaxyExploration = ({ vehicle }: GalaxyExplorationProps) => {
  const [nearPlanet, setNearPlanet] = useState<PlanetData | null>(null);
  const [orbitingPlanet, setOrbitingPlanet] = useState<PlanetData | null>(null);
  const [viewingPlanet, setViewingPlanet] = useState<PlanetData | null>(null);
  const [collisionFlash, setCollisionFlash] = useState(false);

  const handleShipPositionUpdate = useCallback(() => {
    // No-op, minimap removed
  }, []);

  const handleAsteroidCollision = useCallback(() => {
    setCollisionFlash(true);
    setTimeout(() => setCollisionFlash(false), 200);
  }, []);

  const handleEnterPlanet = useCallback(() => {
    if (orbitingPlanet) {
      setViewingPlanet(orbitingPlanet);
    }
  }, [orbitingPlanet]);

  const handleClosePlanetView = useCallback(() => {
    setViewingPlanet(null);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d25] to-[#050515]">
      {/* Collision flash overlay */}
      <AnimatePresence>
        {collisionFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <Canvas 
        camera={{ position: [50, 20, 50], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <GalaxyScene 
            vehicle={vehicle}
            onPlanetApproach={setNearPlanet}
            onOrbitCapture={setOrbitingPlanet}
            orbitingPlanet={orbitingPlanet}
            showEnterButton={orbitingPlanet !== null}
            onAsteroidCollision={handleAsteroidCollision}
            onShipPositionUpdate={handleShipPositionUpdate}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-5 py-4 border border-accent/30 shadow-lg shadow-accent/10">
          <h2 className="text-foreground text-2xl font-bold mb-1 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Galaxy Explorer</h2>
          <p className="text-muted-foreground text-sm">
            {vehicle === "rocket" ? "🚀" : "🧑‍🚀"} Flying as {vehicle === "rocket" ? "Rocket" : "Astronaut"}
          </p>
        </div>
      </div>


      {/* Controls info */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-xl px-5 py-4 border border-border/30 shadow-lg">
          <p className="text-foreground text-sm font-medium mb-2">Controls</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>W / ↑</span><span>Thrust Forward</span>
            <span>S / ↓</span><span>Brake</span>
            <span>A / ←</span><span>Turn Left</span>
            <span>D / →</span><span>Turn Right</span>
            <span>Space</span><span>Rise</span>
            <span>Shift</span><span>Descend</span>
          </div>
        </div>
      </div>

      {/* Near planet indicator */}
      <AnimatePresence>
        {nearPlanet && !orbitingPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-44 right-6 pointer-events-none"
          >
            <div 
              className="backdrop-blur-md rounded-xl px-5 py-4 border shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${nearPlanet.color}33, transparent)`,
                borderColor: `${nearPlanet.color}55`,
                boxShadow: `0 0 20px ${nearPlanet.color}33`,
              }}
            >
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Approaching</p>
              <p className="text-foreground text-xl font-bold">{nearPlanet.name}</p>
              <p className="text-muted-foreground text-sm mt-1">Gravity field detected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbiting indicator with enter button */}
      <AnimatePresence>
        {orbitingPlanet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="backdrop-blur-md rounded-2xl px-8 py-6 border shadow-2xl text-center"
              style={{
                background: `linear-gradient(135deg, ${orbitingPlanet.color}44, ${orbitingPlanet.color}11)`,
                borderColor: `${orbitingPlanet.color}66`,
                boxShadow: `0 0 40px ${orbitingPlanet.color}44`,
              }}
            >
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Orbiting</p>
              <p className="text-foreground text-3xl font-bold mb-4">{orbitingPlanet.name}</p>
              
              <button
                onClick={handleEnterPlanet}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  background: orbitingPlanet.color,
                  color: '#000',
                  boxShadow: `0 0 20px ${orbitingPlanet.color}88`,
                }}
              >
                Enter Planet
              </button>
              
              <p className="text-muted-foreground text-xs mt-4">
                Press W/A/S/D or Arrow keys to escape orbit
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet detail view */}
      <AnimatePresence>
        {viewingPlanet && (
          <PlanetDetail planet={viewingPlanet} onClose={handleClosePlanetView} />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="bg-gradient-to-br from-background/70 to-background/50 backdrop-blur-md rounded-xl px-5 py-3 border border-border/30">
          <p className="text-muted-foreground text-sm">
            ⚠️ Asteroid belt ahead! Navigate carefully.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalaxyExploration;
