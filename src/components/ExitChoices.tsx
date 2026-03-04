import { Suspense, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import ExitModels from "./ExitModels";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "./StarField";

interface ExitChoicesProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
}

// Planet data matching GalaxyExploration
const PLANETS_DATA = [
  { id: 0, name: "Pyralis", orbitRadius: 22, size: 2.8, color: "#ff7755", orbitSpeed: 0.25, rotationSpeed: 1.8, spotColor: "#ffaa88", glowColor: "#ff9966", hasSatellite: true, initialAngle: 0 },
  { id: 1, name: "Aquaris", orbitRadius: 32, size: 4, color: "#55aaff", orbitSpeed: 0.18, rotationSpeed: 1.4, spotColor: "#88ccff", glowColor: "#77bbff", hasRing: true, ringColor: "#8899bb", initialAngle: Math.PI * 0.5 },
  { id: 2, name: "Verdania", orbitRadius: 44, size: 3.5, color: "#66ff88", orbitSpeed: 0.22, rotationSpeed: 2.5, spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI },
  { id: 3, name: "Solarius", orbitRadius: 58, size: 7, color: "#ffbb55", orbitSpeed: 0.08, rotationSpeed: 0.6, spotColor: "#ffdd88", glowColor: "#ffcc66", hasRing: true, ringColor: "#ddaa66", hasSatellite: true, initialAngle: Math.PI * 1.3 },
  { id: 4, name: "Nebulora", orbitRadius: 75, size: 5.5, color: "#bb77ff", orbitSpeed: 0.06, rotationSpeed: 0.8, spotColor: "#dd99ff", glowColor: "#cc88ff", hasSatellite: true, initialAngle: Math.PI * 0.7 },
  { id: 5, name: "Rosaria", orbitRadius: 92, size: 3, color: "#ff77aa", orbitSpeed: 0.12, rotationSpeed: 1.5, spotColor: "#ff99cc", glowColor: "#ff88bb", initialAngle: Math.PI * 1.8 },
  { id: 6, name: "Cryonia", orbitRadius: 110, size: 6, color: "#77ffff", orbitSpeed: 0.04, rotationSpeed: 0.5, spotColor: "#99ffff", glowColor: "#88ffff", hasRing: true, ringColor: "#66cccc", hasSatellite: true, initialAngle: Math.PI * 0.3 },
];

// Blinking Stars Background
const BlinkingStars = ({ count = 2000 }: { count?: number }) => {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const starColors = [
      [1.0, 1.0, 1.0],
      [1.0, 0.92, 0.82],  // warm white
      [0.75, 0.88, 1.0],  // cool blue-white
      [1.0, 0.78, 0.55],  // orange giant
      [0.92, 0.96, 1.0],  // near-white
      [0.65, 0.75, 1.0],  // blue dwarf
      [1.0, 0.95, 0.70],  // yellow-white
    ];

    for (let i = 0; i < count; i++) {
      const radius = 150 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const roll = Math.random();
      sizes[i] = roll > 0.97 ? Math.random() * 5 + 4 : Math.random() * 3 + 0.8;
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
        const blink = Math.sin(time * (0.4 + (i % 13) * 0.07) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.35 + blink * 0.65);
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
        size={2.2}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Procedural sun texture (shared with GalaxyExploration style)
const buildSunTexture = (): THREE.CanvasTexture => {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const base = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  base.addColorStop(0.0, "#fffde0");
  base.addColorStop(0.2, "#ffe560");
  base.addColorStop(0.5, "#ffb830");
  base.addColorStop(0.8, "#ff7800");
  base.addColorStop(1.0, "#cc3300");
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    const r = Math.random() * 18 + 4;
    const bright = Math.random() > 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, bright ? "rgba(255,255,200,0.45)" : "rgba(160,60,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.5), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 8; i++) {
    const x = 80 + Math.random() * (w - 160), y = 60 + Math.random() * (h - 120);
    const r1 = Math.random() * 20 + 10;
    const sp = ctx.createRadialGradient(x, y, 0, x, y, r1);
    sp.addColorStop(0, "rgba(40,10,0,0.85)");
    sp.addColorStop(0.5, "rgba(100,30,0,0.5)");
    sp.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sp;
    ctx.beginPath(); ctx.arc(x, y, r1, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const sunTexture = useMemo(() => buildSunTexture(), []);
  const roughMap = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const cx = c.getContext("2d")!; cx.fillStyle = "#111"; cx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (sunRef.current) { sunRef.current.rotation.y = time * 0.06; sunRef.current.rotation.x = Math.sin(time * 0.03) * 0.05; }
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(time * 1.2) * 0.07);
    if (glow2Ref.current) { glow2Ref.current.scale.setScalar(1 + Math.sin(time * 0.8 + 1) * 0.05); glow2Ref.current.rotation.y = time * 0.015; }
    if (coronaRef.current) { coronaRef.current.scale.setScalar(1 + Math.sin(time * 0.5 + 2) * 0.04); coronaRef.current.rotation.z = time * 0.008; }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 128, 128]} />
        <meshStandardMaterial map={sunTexture} emissiveMap={sunTexture} emissive={new THREE.Color("#ff9900")} emissiveIntensity={1.8} roughnessMap={roughMap} roughness={0.05} metalness={0} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[9.2, 64, 64]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[11, 64, 64]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coronaRef}>
        <sphereGeometry args={[14, 48, 48]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#fff5cc" intensity={12} distance={350} decay={1.5} />
      <pointLight color="#ff8800" intensity={4} distance={150} decay={2} />
      <pointLight color="#aaddff" intensity={1.2} distance={250} decay={2} position={[-60, 20, -60]} />
    </group>
  );
};

// Orbital Path - matching GalaxyExploration
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
const GalaxyPlanet = ({ planet }: { planet: typeof PLANETS_DATA[0] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const atmo2Ref = useRef<THREE.Mesh>(null);

  const { diffuseMap, roughnessMap } = useMemo(() => {
    const w = 1024, h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const base = ctx.createLinearGradient(0, 0, w, 0);
    base.addColorStop(0, planet.color);
    base.addColorStop(0.35, planet.spotColor || planet.color);
    base.addColorStop(0.65, planet.color);
    base.addColorStop(1, planet.spotColor || planet.color);
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    // Equatorial darker band
    const eqGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
    const cObj = new THREE.Color(planet.color);
    eqGrad.addColorStop(0, "rgba(0,0,0,0)");
    eqGrad.addColorStop(0.5, `rgba(${Math.round(cObj.r * 30)},${Math.round(cObj.g * 30)},${Math.round(cObj.b * 30)},0.35)`);
    eqGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eqGrad; ctx.fillRect(0, 0, w, h);
    // Atmospheric band stripes
    for (let band = 0; band < 8; band++) {
      const cy = (band / 8) * h + h * 0.05;
      const bw = 12 + Math.random() * 30;
      const alpha = 0.06 + Math.random() * 0.14;
      const bg = ctx.createLinearGradient(0, cy - bw, 0, cy + bw);
      bg.addColorStop(0, "rgba(0,0,0,0)");
      bg.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, cy - bw, w, bw * 2);
    }
    // Continental patches
    const spotC = planet.spotColor || "rgba(255,255,255,0.3)";
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const rx = Math.random() * 80 + 25, ry = Math.random() * 40 + 10;
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      g2.addColorStop(0, spotC);
      g2.addColorStop(0.6, spotC.startsWith("#") ? spotC + "99" : "rgba(200,200,200,0.2)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    // Craters
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 12 + 3;
      const cr = ctx.createRadialGradient(x, y, 0, x, y, r);
      cr.addColorStop(0, "rgba(0,0,0,0.35)"); cr.addColorStop(0.7, "rgba(0,0,0,0.1)"); cr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cr;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Polar caps
    const topCap = ctx.createLinearGradient(0, 0, 0, h * 0.2);
    topCap.addColorStop(0, "rgba(240,248,255,0.85)"); topCap.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topCap; ctx.fillRect(0, 0, w, h * 0.2);
    const botCap = ctx.createLinearGradient(0, h * 0.8, 0, h);
    botCap.addColorStop(0, "rgba(0,0,0,0)"); botCap.addColorStop(1, "rgba(240,248,255,0.75)");
    ctx.fillStyle = botCap; ctx.fillRect(0, h * 0.8, w, h * 0.2);
    const diffuseMap = new THREE.CanvasTexture(canvas);
    diffuseMap.wrapS = THREE.RepeatWrapping; diffuseMap.anisotropy = 8;
    // Roughness map
    const rc = document.createElement("canvas"); rc.width = 512; rc.height = 256;
    const rx2 = rc.getContext("2d")!; rx2.fillStyle = "#888"; rx2.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 12; i++) {
      const x2 = Math.random() * 512, y2 = Math.random() * 256, rRad = Math.random() * 60 + 20;
      const rg = rx2.createRadialGradient(x2, y2, 0, x2, y2, rRad);
      rg.addColorStop(0, "#ddd"); rg.addColorStop(1, "rgba(0,0,0,0)");
      rx2.fillStyle = rg; rx2.beginPath(); rx2.ellipse(x2, y2, rRad, rRad * 0.6, Math.random() * Math.PI, 0, Math.PI * 2); rx2.fill();
    }
    const roughnessMap = new THREE.CanvasTexture(rc); roughnessMap.wrapS = THREE.RepeatWrapping;
    return { diffuseMap, roughnessMap };
  }, [planet.color, planet.spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = time * planet.orbitSpeed + planet.initialAngle;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
    }
    if (planetRef.current) planetRef.current.rotation.y = time * planet.rotationSpeed;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y = time * planet.rotationSpeed * 0.5;
    if (atmo2Ref.current) atmo2Ref.current.rotation.y = -time * planet.rotationSpeed * 0.3;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.size, 128, 128]} />
        <meshStandardMaterial
          map={diffuseMap}
          roughnessMap={roughnessMap}
          emissive={new THREE.Color(planet.color)}
          emissiveIntensity={0.06}
          metalness={0.05}
          roughness={0.82}
        />
      </mesh>

      {/* Inner atmosphere limb glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size * 1.04, 64, 64]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Mid atmosphere haze */}
      <mesh ref={atmo2Ref}>
        <sphereGeometry args={[planet.size * 1.10, 48, 48]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[planet.size * 1.22, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
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

      <pointLight color={planet.color} intensity={0.5} distance={planet.size * 6} />
    </group>
  );
};

// Galaxy Scene matching GalaxyExploration
const GalaxyScene = () => {
  return (
    <group position={[0, 5, -60]}>
      {/* Central Galaxy Core/Sun */}
      <GalaxyCore />

      {/* Orbital Paths */}
      {PLANETS_DATA.map((planet) => (
        <OrbitalPath key={`orbit-${planet.id}`} radius={planet.orbitRadius} color={planet.glowColor} />
      ))}

      {/* Planets */}
      {PLANETS_DATA.map((planet) => (
        <GalaxyPlanet key={`planet-${planet.id}`} planet={planet} />
      ))}
    </group>
  );
};




// Space station interior with transparent walls
const StationInterior = () => {
  return (
    <group>
      {/* Floor - fully transparent */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a18" transparent opacity={0.0} />
      </mesh>

      {/* Floor grid - removed for transparency */}

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
      {/* CSS twinkling stars — same as start screen */}
      <StarField />

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

          {/* Galaxy Scene matching GalaxyExploration */}
          <GalaxyScene />

          {/* Space station interior with transparent walls */}
          <StationInterior />

          {/* Blinking stars background - matching GalaxyExploration */}
          <BlinkingStars count={5000} />

          {/* Vehicle selection models */}
          <group position={[0, -2, 0]}>
            <ExitModels onSelect={onSelect} hovered={hovered} setHovered={setHovered} />
          </group>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
            autoRotate={true}
            autoRotateSpeed={0.5}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>

      {/* Title — centered horizontally at the top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-14 sm:top-6 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-4"
      >
        <motion.h1
          className="text-base sm:text-xl md:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-center"
          style={{
            background: "linear-gradient(90deg, #00e5ff, #ffffff, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(0,229,255,0.5))",
          }}
        >
          Navigate Your Own Constellation
        </motion.h1>

        <motion.div
          className="mt-2 h-px w-32 sm:w-48 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #00e5ff, #a855f7, transparent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>

      {/* Corner decorative elements — hide on very small screens */}
      <div className="hidden sm:block absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-2 border-t-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-2 border-t-2 border-pink-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-2 border-b-2 border-cyan-500/50 pointer-events-none z-20" />
      <div className="hidden sm:block absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-2 border-b-2 border-pink-500/50 pointer-events-none z-20" />

      {/* Hover hint — hidden on touch devices, shown on desktop hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:block absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
          >
            <div
              className={`relative overflow-hidden rounded-xl px-6 py-3 backdrop-blur-md shadow-2xl
              ${hovered === "rocket"
                  ? "bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 border border-emerald-400/50"
                  : "bg-gradient-to-r from-pink-900/80 to-purple-900/80 border border-pink-400/50"
                }`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <p className="text-foreground text-lg font-bold tracking-wide relative z-10">
                {hovered === "rocket" ? "🚀 ROCKET" : "🧑‍🚀 ASTRONAUT"}
              </p>
              <p className={`text-sm mt-1 relative z-10 ${hovered === "rocket" ? "text-emerald-300" : "text-pink-300"}`}>
                {hovered === "rocket" ? "Fast & Powerful Navigation" : "Free & Agile Exploration"}
              </p>
              <motion.p
                className="text-xs text-muted-foreground mt-1 relative z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Click to launch
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tap labels — shown only on small screens */}
      <div className="sm:hidden absolute bottom-28 inset-x-0 flex justify-around px-6 pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg">🚀</span>
          <span className="text-xs font-bold text-emerald-400 tracking-wider">ROCKET</span>
          <span className="text-[10px] text-gray-400">Speed & Power</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg">🧑‍🚀</span>
          <span className="text-xs font-bold text-pink-400 tracking-wider">ASTRONAUT</span>
          <span className="text-[10px] text-gray-400">Freedom & Control</span>
        </motion.div>
      </div>

      {/* Bottom instruction bar — stacks on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-1 sm:gap-8 text-muted-foreground text-xs sm:text-sm pointer-events-none z-20 items-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Rocket: Speed & Power</span>
          <span className="sm:hidden">Tap a vehicle to begin</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span>Astronaut: Freedom & Control</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ExitChoices;
