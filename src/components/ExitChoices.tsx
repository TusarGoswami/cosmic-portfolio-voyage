import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";
import { motion, AnimatePresence } from "framer-motion";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Enhanced animated nebula with shader effects
const NebulaCloud = ({ 
  position, 
  color, 
  scale = 1,
  rotationSpeed = 0.02 
}: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  rotationSpeed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(color) },
        color2: { value: new THREE.Color(color).multiplyScalar(0.3) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
          float f = 0.0;
          f += 0.5 * noise(p); p *= 2.01;
          f += 0.25 * noise(p); p *= 2.02;
          f += 0.125 * noise(p); p *= 2.03;
          f += 0.0625 * noise(p);
          return f;
        }
        
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          vec2 q = vec2(fbm(uv + time * 0.1), fbm(uv + vec2(1.0)));
          vec2 r = vec2(fbm(uv + q + time * 0.05), fbm(uv + q + vec2(2.0)));
          float f = fbm(uv + r);
          
          float alpha = smoothstep(0.6, 0.0, dist) * (0.4 + 0.3 * f);
          vec3 color = mix(color1, color2, f + dist);
          
          gl_FragColor = vec4(color, alpha * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z += rotationSpeed * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[30, 30, 1, 1]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

// Animated nebula system with multiple layers
const NebulaEffect = () => {
  return (
    <group position={[0, 0, -100]}>
      {/* Primary nebulae */}
      <NebulaCloud position={[-50, 20, -30]} color="#ff44aa" scale={4} rotationSpeed={0.015} />
      <NebulaCloud position={[60, -10, -50]} color="#4488ff" scale={5} rotationSpeed={-0.02} />
      <NebulaCloud position={[0, 40, -40]} color="#aa44ff" scale={3.5} rotationSpeed={0.018} />
      <NebulaCloud position={[-40, -30, -60]} color="#44ffaa" scale={4.5} rotationSpeed={-0.012} />
      <NebulaCloud position={[50, 35, -70]} color="#ffaa44" scale={3} rotationSpeed={0.025} />
      
      {/* Distant nebulae for depth */}
      <NebulaCloud position={[-80, 0, -100]} color="#ff6699" scale={8} rotationSpeed={0.008} />
      <NebulaCloud position={[80, 20, -120]} color="#6699ff" scale={7} rotationSpeed={-0.01} />
    </group>
  );
};

// Shooting stars effect
const ShootingStars = () => {
  const shootingStarsRef = useRef<THREE.Group>(null);
  const starRefs = useRef<THREE.Mesh[]>([]);
  const trailRefs = useRef<THREE.Mesh[]>([]);
  
  const starsData = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      delay: i * 1.5,
      startX: -80 + Math.random() * 40,
      startY: 30 + Math.random() * 30,
      startZ: -60 - Math.random() * 40,
      speed: 0.8 + Math.random() * 0.4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
    })),
  []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    starsData.forEach((star, i) => {
      const starMesh = starRefs.current[i];
      const trailMesh = trailRefs.current[i];
      if (!starMesh || !trailMesh) return;
      
      const cycleTime = (time + star.delay) % 6;
      const progress = cycleTime / 1.5;
      
      if (progress < 1) {
        const moveX = progress * 100 * Math.cos(star.angle);
        const moveY = -progress * 100 * Math.sin(star.angle);
        
        starMesh.position.set(
          star.startX + moveX,
          star.startY + moveY,
          star.startZ
        );
        starMesh.visible = true;
        starMesh.scale.setScalar(1 - progress * 0.6);
        
        trailMesh.position.copy(starMesh.position);
        trailMesh.position.x -= 4 * Math.cos(star.angle);
        trailMesh.position.y += 4 * Math.sin(star.angle);
        trailMesh.visible = true;
        trailMesh.scale.set(1 - progress * 0.3, 1, 1);
        (trailMesh.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - progress);
      } else {
        starMesh.visible = false;
        trailMesh.visible = false;
      }
    });
  });

  return (
    <group ref={shootingStarsRef}>
      {starsData.map((star, i) => (
        <group key={i}>
          <mesh 
            ref={(el) => { if (el) starRefs.current[i] = el; }}
            visible={false}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh 
            ref={(el) => { if (el) trailRefs.current[i] = el; }}
            rotation={[0, 0, -star.angle]}
            visible={false}
          >
            <planeGeometry args={[12, 0.4]} />
            <meshBasicMaterial 
              color="#aaddff" 
              transparent 
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Cosmic dust particles
const CosmicDust = () => {
  const dustRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes } = useMemo(() => {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    
    const colorOptions = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#aaccff"),
      new THREE.Color("#ffccaa"),
      new THREE.Color("#ccaaff"),
      new THREE.Color("#aaffcc"),
    ];
    
    for (let i = 0; i < count; i++) {
      const radius = 30 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi) - 50;
      
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      
      siz[i] = Math.random() * 2 + 0.5;
    }
    
    return { positions: pos, colors: col, sizes: siz };
  }, []);

  useFrame((state) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      dustRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.1;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={5000} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={5000} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Glowing cosmic ring effect
const CosmicRing = ({ radius, color, speed = 0.1 }: { radius: number; color: string; speed?: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      ringRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -80]}>
      <torusGeometry args={[radius, 0.3, 16, 100]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Mini Galaxy - matches the original galaxy exploration style
const MiniGalaxy = () => {
  const galaxyRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Create orbital paths and mini planets data
  const planetsData = useMemo(
    () => [
      { orbitRadius: 8, size: 0.8, color: "#ff7755", speed: 0.4, initialAngle: 0 },
      { orbitRadius: 12, size: 1.2, color: "#55aaff", speed: 0.3, initialAngle: Math.PI * 0.5, hasRing: true },
      { orbitRadius: 17, size: 1, color: "#66ff88", speed: 0.35, initialAngle: Math.PI },
      { orbitRadius: 22, size: 2, color: "#ffbb55", speed: 0.15, initialAngle: Math.PI * 1.3, hasRing: true },
      { orbitRadius: 28, size: 1.6, color: "#bb77ff", speed: 0.12, initialAngle: Math.PI * 0.7 },
      { orbitRadius: 34, size: 0.9, color: "#ff77aa", speed: 0.2, initialAngle: Math.PI * 1.8 },
      { orbitRadius: 40, size: 1.8, color: "#77ffff", speed: 0.08, initialAngle: Math.PI * 0.3, hasRing: true },
    ],
    [],
  );

  // Star field
  const { starPositions, starColors, starSizes } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const starColorOptions = [
      [1, 1, 1],
      [1, 0.9, 0.8],
      [0.8, 0.9, 1],
      [1, 0.8, 0.6],
    ];

    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorIdx = Math.floor(Math.random() * starColorOptions.length);
      colors[i * 3] = starColorOptions[colorIdx][0];
      colors[i * 3 + 1] = starColorOptions[colorIdx][1];
      colors[i * 3 + 2] = starColorOptions[colorIdx][2];

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { starPositions: positions, starColors: colors, starSizes: sizes };
  }, []);

  // Planet positions ref for animation
  const planetRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = time * 0.02;
    }

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.1);
    }

    // Animate planets
    planetRefs.current.forEach((planet, i) => {
      if (planet && planetsData[i]) {
        const { orbitRadius, speed, initialAngle } = planetsData[i];
        const angle = time * speed + initialAngle;
        planet.position.x = Math.cos(angle) * orbitRadius;
        planet.position.z = Math.sin(angle) * orbitRadius;
      }
    });
  });

  return (
    <group ref={galaxyRef} position={[0, 5, -50]} rotation={[0.3, 0, 0.1]}>
      {/* Central Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>

      {/* Sun glow layers */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>

      {/* Orbital paths */}
      {planetsData.map((planet, i) => (
        <mesh key={`orbit-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.orbitRadius - 0.05, planet.orbitRadius + 0.05, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Planets */}
      {planetsData.map((planet, i) => (
        <group key={`planet-${i}`}>
          <group
            ref={(el) => {
              if (el) planetRefs.current[i] = el;
            }}
            position={[planet.orbitRadius, 0, 0]}
          >
            <mesh>
              <sphereGeometry args={[planet.size, 32, 32]} />
              <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.2} />
            </mesh>
            {planet.hasRing && (
              <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                <ringGeometry args={[planet.size * 1.4, planet.size * 2, 32]} />
                <meshBasicMaterial color={planet.color} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        </group>
      ))}

      {/* Background stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3000} array={starPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={3000} array={starColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Sun light */}
      <pointLight color="#ffdd44" intensity={3} distance={100} />
    </group>
  );
};

// Detailed planet with texture effects
const DetailedPlanet = ({ 
  position, 
  size, 
  color, 
  emissiveColor,
  hasRing = false, 
  ringColor,
  rotationSpeed = 0.001 
}: { 
  position: [number, number, number]; 
  size: number; 
  color: string; 
  emissiveColor?: string;
  hasRing?: boolean; 
  ringColor?: string;
  rotationSpeed?: number;
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= rotationSpeed * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Main planet body */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          color={color}
          emissive={emissiveColor || color}
          emissiveIntensity={0.15}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial 
          color={emissiveColor || color} 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={1.15}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial 
          color={emissiveColor || color} 
          transparent 
          opacity={0.08} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ring if applicable */}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
          <meshBasicMaterial 
            color={ringColor || color} 
            transparent 
            opacity={0.6} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}

      {/* Surface details - darker spots */}
      {Array.from({ length: 6 }).map((_, i) => {
        const theta = (i / 6) * Math.PI * 2;
        const phi = 0.3 + Math.random() * 0.4 * Math.PI;
        const x = size * 0.95 * Math.sin(phi) * Math.cos(theta);
        const y = size * 0.95 * Math.cos(phi);
        const z = size * 0.95 * Math.sin(phi) * Math.sin(theta);
        const spotSize = size * (0.15 + Math.random() * 0.2);
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[spotSize, 16, 16]} />
            <meshBasicMaterial 
              color={new THREE.Color(color).multiplyScalar(0.6)} 
              transparent 
              opacity={0.4} 
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Animated sun corona/flare effect
const SunCorona = () => {
  const coronaRef = useRef<THREE.Group>(null);
  const flareRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (coronaRef.current) {
      coronaRef.current.rotation.z = time * 0.05;
    }
    flareRefs.current.forEach((flare, i) => {
      if (flare && flare.material) {
        const scale = 1 + Math.sin(time * 2 + i * 0.5) * 0.3;
        flare.scale.setScalar(scale);
        const mat = flare.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(time * 3 + i) * 0.15;
      }
    });
  });

  return (
    <group ref={coronaRef}>
      {/* Corona rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={`ray-${i}`}
            ref={(el) => { if (el) flareRefs.current[i] = el; }}
            position={[Math.cos(angle) * 10, Math.sin(angle) * 10, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <planeGeometry args={[2, 8]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Asteroid belt between Mars and Jupiter
const AsteroidBelt = ({ innerRadius, outerRadius }: { innerRadius: number; outerRadius: number }) => {
  const asteroidsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      siz[i] = Math.random() * 0.5 + 0.2;
    }

    return { positions: pos, sizes: siz };
  }, [innerRadius, outerRadius]);

  useFrame((state) => {
    if (asteroidsRef.current) {
      asteroidsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={asteroidsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={500} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.4} 
        color="#8b7355" 
        transparent 
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Enhanced solar system with sun in center and orbiting planets
const SolarSystem = () => {
  const systemRef = useRef<THREE.Group>(null);
  const planetGroupRefs = useRef<THREE.Group[]>([]);
  const sunRef = useRef<THREE.Mesh>(null);

  const planetsData = useMemo(() => [
    { orbitRadius: 15, size: 1.5, color: "#8b7355", emissiveColor: "#a08060", speed: 0.2, name: "Mercury", tilt: 0.03 },
    { orbitRadius: 22, size: 2.5, color: "#e6b800", emissiveColor: "#ffd700", speed: 0.15, name: "Venus", tilt: 0.05 },
    { orbitRadius: 30, size: 3, color: "#1e90ff", emissiveColor: "#4fc3f7", speed: 0.12, name: "Earth", hasMoon: true, tilt: 0.1 },
    { orbitRadius: 40, size: 2, color: "#cd5c5c", emissiveColor: "#ff6347", speed: 0.09, name: "Mars", tilt: 0.08 },
    { orbitRadius: 58, size: 6, color: "#daa520", emissiveColor: "#f4a460", speed: 0.05, hasRing: false, name: "Jupiter", hasStripes: true, tilt: 0.02 },
    { orbitRadius: 75, size: 5, color: "#f5deb3", emissiveColor: "#ffe4b5", speed: 0.035, hasRing: true, ringColor: "#d4a574", name: "Saturn", tilt: 0.15 },
    { orbitRadius: 92, size: 3.5, color: "#40e0d0", emissiveColor: "#7fffd4", speed: 0.02, hasRing: true, ringColor: "#48d1cc", name: "Uranus", tilt: 0.5 },
  ], []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotate sun
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.02;
    }
    
    // Rotate each planet around the sun
    planetGroupRefs.current.forEach((group, i) => {
      if (group && planetsData[i]) {
        const angle = time * planetsData[i].speed;
        group.rotation.y = angle;
      }
    });
  });

  return (
    <group ref={systemRef} position={[0, 5, -55]} rotation={[0.35, 0, 0.05]}>
      {/* Central Sun - multi-layered for depth */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[7, 64, 64]} />
        <meshBasicMaterial color="#fff5cc" />
      </mesh>
      
      {/* Sun surface texture layer */}
      <mesh>
        <sphereGeometry args={[7.1, 64, 64]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.6} />
      </mesh>
      
      {/* Sun glow layers - multiple for depth */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[9.5, 32, 32]} />
        <meshBasicMaterial color="#ff9933" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[11, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[13, 32, 32]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Sun corona flares */}
      <SunCorona />

      {/* Sun light - warm and intense */}
      <pointLight color="#fff8e0" intensity={4} distance={250} />
      <pointLight color="#ffaa00" intensity={2} distance={150} />

      {/* Orbital paths with gradient effect */}
      {planetsData.map((planet, i) => (
        <group key={`orbit-group-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.orbitRadius - 0.08, planet.orbitRadius + 0.08, 256]} />
            <meshBasicMaterial 
              color={planet.emissiveColor} 
              transparent 
              opacity={0.12} 
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Outer glow for orbit */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.orbitRadius - 0.3, planet.orbitRadius + 0.3, 128]} />
            <meshBasicMaterial 
              color={planet.emissiveColor} 
              transparent 
              opacity={0.05} 
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Asteroid belt between Mars and Jupiter */}
      <AsteroidBelt innerRadius={47} outerRadius={52} />

      {/* Orbiting planets */}
      {planetsData.map((planet, i) => (
        <group 
          key={`planet-orbit-${i}`}
          ref={(el) => {
            if (el) planetGroupRefs.current[i] = el;
          }}
        >
          <group position={[planet.orbitRadius, 0, 0]} rotation={[planet.tilt, 0, 0]}>
            <DetailedPlanet 
              position={[0, 0, 0]}
              size={planet.size}
              color={planet.color}
              emissiveColor={planet.emissiveColor}
              hasRing={planet.hasRing}
              ringColor={planet.ringColor}
              rotationSpeed={0.003}
            />
            
            {/* Moon for Earth */}
            {planet.hasMoon && (
              <group>
                <mesh position={[planet.size + 2, 0, 0]}>
                  <sphereGeometry args={[0.6, 32, 32]} />
                  <meshStandardMaterial color="#cccccc" emissive="#888888" emissiveIntensity={0.2} />
                </mesh>
              </group>
            )}

            {/* Point light for each planet glow */}
            <pointLight color={planet.emissiveColor} intensity={0.3} distance={planet.size * 4} />
          </group>
        </group>
      ))}

      {/* Background star dust particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={1000} 
            array={useMemo(() => {
              const arr = new Float32Array(1000 * 3);
              for (let i = 0; i < 1000; i++) {
                const radius = 100 + Math.random() * 100;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                arr[i * 3 + 2] = radius * Math.cos(phi);
              }
              return arr;
            }, [])} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.8} 
          color="#ffffff" 
          transparent 
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// Space station interior with transparent walls
const StationInterior = () => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
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

      {/* Ceiling - semi-transparent */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a15" transparent opacity={0.6} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* LEFT WALL - Transparent glass */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial 
          color="#1a2a4a"
          transparent 
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Left wall frame edges */}
      <mesh position={[-10, -3.5, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-10, 8, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* RIGHT WALL - Transparent glass */}
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial 
          color="#1a2a4a"
          transparent 
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right wall frame edges */}
      <mesh position={[10, -3.5, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[10, 8, 0]}>
        <boxGeometry args={[0.15, 0.15, 20]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* BACK WALL - Transparent glass */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 12]} />
        <meshPhysicalMaterial 
          color="#1a2a4a"
          transparent 
          opacity={0.1}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Back wall frame edges */}
      <mesh position={[0, -3.5, -10]}>
        <boxGeometry args={[20, 0.15, 0.15]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 8, -10]}>
        <boxGeometry args={[20, 0.15, 0.15]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.5} />
      </mesh>

      {/* Vertical corner pillars */}
      {[[-10, -10], [10, -10], [-10, 10], [10, 10]].map(([x, z], i) => (
        <mesh key={`pillar-${i}`} position={[x, 2.25, z]}>
          <boxGeometry args={[0.2, 11.5, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* LED strips on floor edges */}
      <mesh position={[-9.9, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[9.9, -3.4, 0]}>
        <boxGeometry args={[0.1, 0.05, 18]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -3.4, -9.9]}>
        <boxGeometry args={[18, 0.05, 0.1]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.9} />
      </mesh>

      {/* Ceiling lights - point lights only */}
      {Array.from({ length: 3 }).map((_, i) => (
        <pointLight 
          key={`ceiling-light-${i}`} 
          position={[0, 7.5, -6 + i * 6]} 
          color="#ffffff" 
          intensity={0.6} 
          distance={12} 
        />
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
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-background/20 pointer-events-none z-10" />

      <Canvas camera={{ position: [0, 2, 12], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, 8, 0]} intensity={0.6} color="#4fc3f7" />
          <pointLight position={[-5, 3, 5]} intensity={0.4} color="#00ffaa" />
          <pointLight position={[5, 3, 5]} intensity={0.4} color="#ff6699" />

          {/* Fog for depth */}
          <fog attach="fog" args={["#0a0a1a", 15, 80]} />

          {/* Solar system with sun and orbiting planets */}
          <SolarSystem />

          {/* Space station interior with transparent walls */}
          <StationInterior />

          {/* Mini Galaxy visible through window */}
          <MiniGalaxy />

          {/* Enhanced nebula clouds with shader effects */}
          <NebulaEffect />
          
          {/* Shooting stars */}
          <ShootingStars />
          
          {/* Cosmic dust particles */}
          <CosmicDust />
          
          {/* Cosmic rings for added depth */}
          <CosmicRing radius={60} color="#ff44aa" speed={0.08} />
          <CosmicRing radius={80} color="#4488ff" speed={0.05} />
          <CosmicRing radius={100} color="#aa44ff" speed={0.03} />
          
          {/* Background stars - enhanced with more density */}
          <Stars radius={300} depth={100} count={8000} factor={5} saturation={0.7} fade speed={0.5} />

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

      {/* Enhanced Title overlay with animation */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
      >
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3 tracking-wider"></h1>
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-muted-foreground text-lg mt-3 tracking-wide">Choose your path through the cosmos</p>
      </motion.div>

      {/* Corner decorative elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-pink-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-pink-500/50 pointer-events-none z-20" />

      {/* Enhanced Hover hint with animations */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
          >
            <div
              className={`
              relative overflow-hidden rounded-xl px-8 py-4 
              ${
                hovered === "rocket"
                  ? "bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 border border-emerald-400/50"
                  : "bg-gradient-to-r from-pink-900/80 to-purple-900/80 border border-pink-400/50"
              } 
              backdrop-blur-md shadow-2xl
            `}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />

              <p className="text-foreground text-xl font-bold tracking-wide relative z-10">
                {hovered === "rocket" ? "🚀 ROCKET" : "🧑‍🚀 ASTRONAUT"}
              </p>
              <p
                className={`text-sm mt-1 relative z-10 ${hovered === "rocket" ? "text-emerald-300" : "text-pink-300"}`}
              >
                {hovered === "rocket" ? "Fast & Powerful Navigation" : "Free & Agile Exploration"}
              </p>
              <motion.p
                className="text-xs text-muted-foreground mt-2 relative z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Click to launch
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 text-muted-foreground text-sm pointer-events-none z-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Rocket: Speed & Power</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>Astronaut: Freedom & Control</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ExitChoices;
