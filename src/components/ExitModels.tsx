import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Particles from "./Particles";

interface ExitModelsProps {
  onSelect: (vehicle: "rocket" | "astronaut") => void;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}

const ExitModels = ({ onSelect, hovered, setHovered }: ExitModelsProps) => {
  const rocketRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Responsive scale based on viewport width
  const isMobile = viewport.width < 10;
  const isTablet = viewport.width >= 10 && viewport.width < 16;
  const baseScale = isMobile ? 0.6 : isTablet ? 0.85 : 1.1;

  // Cached materials to avoid runtime allocation and shader re-compilation
  const rocketBodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a2e",
    metalness: 0.9,
    roughness: 0.2,
  }), []);

  const rocketAccentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    metalness: 0.8,
    roughness: 0.25,
    emissive: "#00e5ff",
    emissiveIntensity: 0.35,
  }), []);

  const rocketGoldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffd700",
    metalness: 0.9,
    roughness: 0.15,
    emissive: "#ff9500",
    emissiveIntensity: 0.2,
  }), []);

  const finHoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    metalness: 0.85,
    roughness: 0.2,
    emissive: "#00e5ff",
    emissiveIntensity: 0.3,
  }), []);

  const finNormalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffd700",
    metalness: 0.85,
    roughness: 0.2,
    emissive: "#ff9500",
    emissiveIntensity: 0.15,
  }), []);

  const suitMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f0f0f0",
    metalness: 0.2,
    roughness: 0.5,
  }), []);

  const visorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffaa00",
    metalness: 0.95,
    roughness: 0.08,
    emissive: "#ff8800",
    emissiveIntensity: 0.25,
  }), []);

  const gloveHoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffbb00",
    metalness: 0.4,
    roughness: 0.5,
  }), []);

  const gloveNormalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff7700",
    metalness: 0.4,
    roughness: 0.5,
  }), []);

  const btnGreenActive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#00ff00" }), []);
  const btnGreenInactive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#005500" }), []);
  const btnRedActive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ff0000" }), []);
  const btnRedInactive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#550000" }), []);
  const btnBlueActive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0088ff" }), []);
  const btnBlueInactive = useMemo(() => new THREE.MeshBasicMaterial({ color: "#002255" }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (rocketRef.current) {
      const targetScale = hovered === "rocket" ? 1.15 : 1;
      rocketRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      rocketRef.current.position.y = Math.sin(time * 1.2) * 0.15;
      rocketRef.current.rotation.y = time * 0.2;
    }

    if (astronautRef.current) {
      const targetScale = hovered === "astronaut" ? 1.15 : 1;
      astronautRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      astronautRef.current.position.y = Math.sin(time * 1.2 + 1) * 0.15;
      astronautRef.current.rotation.y = Math.sin(time * 0.4) * 0.25;
    }
  });

  return (
    <group scale={baseScale}>
      {/* Platform */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.2, 8, 32]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.8, 7, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </mesh>

      {/* ── Rocket ─────────────────────────────────────────────────── */}
      <group ref={rocketRef} position={[-3, 0, 0]}>
        {/* Dedicated Invisible Raycast Hit Box: 1 primitive cylinder stops all heavy traversals */}
        <mesh
          position={[0, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("rocket");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered("rocket");
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            document.body.style.cursor = "default";
          }}
        >
          <cylinderGeometry args={[1.5, 1.5, 4.8, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Glow ring */}
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.5, 24]} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={hovered === "rocket" ? 0.7 : 0.25}
          />
        </mesh>

        {/* Main rocket body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.7, 3, 24]} />
          <primitive object={rocketBodyMaterial} attach="material" />
        </mesh>

        {/* Body details - rivets/panels */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={`rivet-${i}`}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.52,
              0.8,
              Math.sin((angle * Math.PI) / 180) * 0.52,
            ]}
          >
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#888888" metalness={1} roughness={0.3} />
          </mesh>
        ))}

        {/* Accent stripe band */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.25, 24]} />
          <primitive object={rocketAccentMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.2, 24]} />
          <primitive object={rocketGoldMaterial} attach="material" />
        </mesh>

        {/* Nose cone */}
        <mesh position={[0, 2.5, 0]}>
          <coneGeometry args={[0.5, 1.2, 24]} />
          <primitive object={rocketGoldMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 3.2, 0]}>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <primitive object={rocketAccentMaterial} attach="material" />
        </mesh>

        {/* Windows - portholes */}
        {[0, 120, 240].map((angle, i) => (
          <group key={`window-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0, 1.3, 0.48]}>
              <circleGeometry args={[0.15, 16]} />
              <meshBasicMaterial color="#44aaff" />
            </mesh>
            <mesh position={[0, 1.3, 0.47]}>
              <ringGeometry args={[0.15, 0.19, 16]} />
              <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Fins */}
        {[0, 90, 180, 270].map((angle, i) => (
          <group key={`fin-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0.65, -0.5, 0]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[0.4, 0.8, 0.06]} />
              <primitive object={hovered === "rocket" ? finHoverMaterial : finNormalMaterial} attach="material" />
            </mesh>
            <mesh position={[0.85, -0.7, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Engine section */}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 0.4, 24]} />
          <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.35, 0.55, 0.5, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.15, 24]} />
          <meshStandardMaterial color="#ff4400" metalness={0.5} roughness={0.4} emissive="#ff2200" emissiveIntensity={0.3} />
        </mesh>

        {/* Flame */}
        <mesh position={[0, -1.7, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.35, 0.9, 20]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -1.85, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.7, 20]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -1.95, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.5, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
        </mesh>

        {/* Flame particles — balanced particle counts */}
        <Particles
          position={[0, -1.4, 0]}
          count={35}
          color="#ff6600"
          size={0.1}
          spread={0.35}
          speed={hovered === "rocket" ? 5 : 2.5}
          type="flame"
          active={true}
        />
        <Particles
          position={[0, -1.4, 0]}
          count={20}
          color="#ffff00"
          size={0.07}
          spread={0.2}
          speed={hovered === "rocket" ? 6 : 3}
          type="flame"
          active={true}
        />

        {/* Hover trail particle */}
        <Particles
          position={[0, -1.8, 0]}
          count={25}
          color="#ff8800"
          size={0.05}
          spread={0.5}
          speed={4}
          type="trail"
          active={hovered === "rocket"}
        />

        {/* Rocket lights */}
        <pointLight position={[0, -1, 0]} color="#ff6600" intensity={hovered === "rocket" ? 5 : 2.5} distance={8} decay={2} />
        <pointLight position={[0, 2, 2]} color="#d0e8ff" intensity={1.5} distance={6} decay={2} />
      </group>

      {/* ── Astronaut ──────────────────────────────────────────────── */}
      <group ref={astronautRef} position={[3, 0, 0]}>
        {/* Dedicated Invisible Raycast Hit Box */}
        <mesh
          position={[0, 0.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("astronaut");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered("astronaut");
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            document.body.style.cursor = "default";
          }}
        >
          <capsuleGeometry args={[1.2, 2.8, 4, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Glow ring */}
        <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.5, 24]} />
          <meshBasicMaterial
            color="#66ccff"
            transparent
            opacity={hovered === "astronaut" ? 0.7 : 0.25}
          />
        </mesh>

        {/* Helmet */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.7, 28, 20]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Gold visor */}
        <mesh position={[0, 1.55, 0.45]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={visorMaterial} attach="material" />
        </mesh>

        {/* Helmet rim/collar */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.6, 0.1, 12, 28]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Neck ring */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.15, 20]} />
          <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.55, 0.7, 12, 20]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Chest control unit */}
        <mesh position={[0, 0.35, 0.52]}>
          <boxGeometry args={[0.45, 0.5, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[-0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <primitive object={hovered === "astronaut" ? btnGreenActive : btnGreenInactive} attach="material" />
        </mesh>
        <mesh position={[0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <primitive object={hovered === "astronaut" ? btnRedActive : btnRedInactive} attach="material" />
        </mesh>
        <mesh position={[0, 0.38, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <primitive object={hovered === "astronaut" ? btnBlueActive : btnBlueInactive} attach="material" />
        </mesh>
        <mesh position={[0, 0.22, 0.59]}>
          <boxGeometry args={[0.25, 0.12, 0.01]} />
          <meshBasicMaterial color="#003344" />
        </mesh>

        {/* Backpack */}
        <mesh position={[0, 0.2, -0.55]}>
          <boxGeometry args={[0.75, 0.95, 0.35]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.55, -0.75]}>
          <cylinderGeometry args={[0.1, 0.1, 0.25, 12]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[-0.25, 0.3, -0.75]}>
          <boxGeometry args={[0.12, 0.4, 0.08]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, 0.3, -0.75]}>
          <boxGeometry args={[0.12, 0.4, 0.08]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Jetpack thrusters */}
        <mesh position={[-0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 12]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 12]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>

        {/* Thruster flames */}
        <Particles
          position={[-0.22, -0.4, -0.65]}
          count={15}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={hovered === "astronaut" ? 3 : 1.2}
          type="flame"
          active={true}
        />
        <Particles
          position={[0.22, -0.4, -0.65]}
          count={15}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={hovered === "astronaut" ? 3 : 1.2}
          type="flame"
          active={true}
        />

        {/* Sparkle particle */}
        <Particles
          position={[0, 0.8, 0]}
          count={20}
          color="#88ddff"
          size={0.08}
          spread={1}
          speed={1.2}
          type="sparkle"
          active={hovered === "astronaut"}
        />

        {/* Left Arm */}
        <group position={[-0.75, 0.35, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 6, 12]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.4, -0.35, 0]} rotation={[0, 0, Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 6, 12]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <primitive object={hovered === "astronaut" ? gloveHoverMaterial : gloveNormalMaterial} attach="material" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.75, 0.35, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 6, 12]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.4, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 6, 12]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <primitive object={hovered === "astronaut" ? gloveHoverMaterial : gloveNormalMaterial} attach="material" />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 6, 12]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 6, 12]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Knee joints */}
        <mesh position={[-0.25, -0.95, 0.05]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, -0.95, 0.05]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Lower legs */}
        <mesh position={[-0.25, -1.35, 0]}>
          <capsuleGeometry args={[0.16, 0.4, 6, 12]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[0.25, -1.35, 0]}>
          <capsuleGeometry args={[0.16, 0.4, 6, 12]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Boots */}
        <mesh position={[-0.25, -1.75, 0.08]}>
          <boxGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#222222" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0.25, -1.75, 0.08]}>
          <boxGeometry args={[0.25, 0.25, 0.4]} />
          <meshStandardMaterial color="#222222" metalness={0.75} roughness={0.25} />
        </mesh>

        {/* Studio lights */}
        <pointLight position={[0, 4, 3]} color="#fff8e8" intensity={6} distance={12} decay={1.5} />
        <pointLight position={[-4, 2, 2]} color="#aac8ff" intensity={3} distance={10} decay={2} />
        <pointLight position={[0, 0.5, -4]} color="#66ddff" intensity={hovered === "astronaut" ? 5 : 2.5} distance={8} decay={2} />
      </group>
    </group>
  );
};

export default ExitModels;