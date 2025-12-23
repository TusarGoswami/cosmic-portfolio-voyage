import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HexagonalWindowProps {
  position?: [number, number, number];
}

const HexagonalWindow = ({ position = [0, 0, -8] }: HexagonalWindowProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const galaxyRef = useRef<THREE.Points>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  // Create hexagonal shape
  const hexShape = new THREE.Shape();
  const sides = 6;
  const radius = 2.5;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) hexShape.moveTo(x, y);
    else hexShape.lineTo(x, y);
  }
  hexShape.closePath();

  // Inner hexagon (window opening)
  const innerHex = new THREE.Path();
  const innerRadius = 2.2;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * innerRadius;
    const y = Math.sin(angle) * innerRadius;
    if (i === 0) innerHex.moveTo(x, y);
    else innerHex.lineTo(x, y);
  }
  innerHex.closePath();
  hexShape.holes.push(innerHex);

  // Galaxy particles
  const galaxyGeometry = new THREE.BufferGeometry();
  const galaxyCount = 3000;
  const galaxyPositions = new Float32Array(galaxyCount * 3);
  const galaxyColors = new Float32Array(galaxyCount * 3);

  for (let i = 0; i < galaxyCount; i++) {
    // Spiral galaxy pattern
    const radius = Math.random() * 15 + 5;
    const spinAngle = radius * 0.5;
    const branchAngle = ((i % 3) / 3) * Math.PI * 2;
    const randomX = (Math.random() - 0.5) * 2;
    const randomY = (Math.random() - 0.5) * 2;
    const randomZ = (Math.random() - 0.5) * 0.5;

    galaxyPositions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    galaxyPositions[i * 3 + 1] = randomY;
    galaxyPositions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ - 20;

    // Colors - blue to white gradient
    const mixedColor = new THREE.Color();
    const insideColor = new THREE.Color("#4fc3f7");
    const outsideColor = new THREE.Color("#e1f5fe");
    mixedColor.lerpColors(insideColor, outsideColor, radius / 20);

    galaxyColors[i * 3] = mixedColor.r;
    galaxyColors[i * 3 + 1] = mixedColor.g;
    galaxyColors[i * 3 + 2] = mixedColor.b;
  }

  galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(galaxyPositions, 3));
  galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(galaxyColors, 3));

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Window frame - copper/bronze color like reference */}
      <mesh>
        <extrudeGeometry args={[hexShape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05 }]} />
        <meshStandardMaterial color="#8B5A2B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Inner frame ring */}
      <mesh position={[0, 0, 0.1]}>
        <ringGeometry args={[2.0, 2.2, 6]} />
        <meshStandardMaterial color="#D4A574" metalness={0.9} roughness={0.2} emissive="#3a2a1a" emissiveIntensity={0.2} />
      </mesh>

      {/* Center circle window */}
      <mesh position={[0, 0, 0.2]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshStandardMaterial color="#8B5A2B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Hexagonal dividers */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[0, 0, 0.15]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.08, 2.2, 0.1]} />
            <meshStandardMaterial color="#8B5A2B" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Galaxy visible through window */}
      <points ref={galaxyRef} position={[0, -3, -15]}>
        <bufferGeometry attach="geometry" {...galaxyGeometry} />
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Planet visible through window */}
      <mesh ref={planetRef} position={[1.5, -1, -12]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#4a90d9"
          emissive="#1a4a8a"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Planet atmosphere glow */}
      <mesh position={[1.5, -1, -12]}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" transparent opacity={0.15} />
      </mesh>

      {/* Distant stars background */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#050510" />
      </mesh>
    </group>
  );
};

export default HexagonalWindow;
