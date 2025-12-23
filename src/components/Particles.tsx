import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
  speed?: number;
  position?: [number, number, number];
  type?: "flame" | "sparkle" | "trail";
  active?: boolean;
}

const Particles = ({
  count = 50,
  color = "#ff6600",
  size = 0.05,
  spread = 0.3,
  speed = 2,
  position = [0, 0, 0],
  type = "flame",
  active = true,
}: ParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Random starting position within spread
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = -Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      // Color variation
      const colorVariation = 0.2;
      colors[i * 3] = Math.min(1, baseColor.r + (Math.random() - 0.5) * colorVariation);
      colors[i * 3 + 1] = Math.min(1, baseColor.g + (Math.random() - 0.5) * colorVariation);
      colors[i * 3 + 2] = Math.min(1, baseColor.b + (Math.random() - 0.5) * colorVariation);

      // Random sizes
      sizes[i] = size * (0.5 + Math.random() * 0.5);

      // Velocities for animation
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = -Math.random() * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    velocitiesRef.current = velocities;
    return { positions, colors, sizes };
  }, [count, color, size, spread, speed]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !velocitiesRef.current || !active) return;

    const positionAttr = pointsRef.current.geometry.attributes.position;
    const sizeAttr = pointsRef.current.geometry.attributes.size;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      let x = positionAttr.array[i * 3] as number;
      let y = positionAttr.array[i * 3 + 1] as number;
      let z = positionAttr.array[i * 3 + 2] as number;

      if (type === "flame") {
        // Move downward with some spread
        y -= delta * speed * (0.5 + Math.random() * 0.5);
        x += Math.sin(time * 5 + i) * delta * 0.3;
        z += Math.cos(time * 5 + i) * delta * 0.3;

        // Reset particle when it goes too far
        if (y < -1.5) {
          y = 0;
          x = (Math.random() - 0.5) * spread;
          z = (Math.random() - 0.5) * spread;
        }
      } else if (type === "sparkle") {
        // Sparkle outward from center
        const angle = Math.atan2(z, x);
        const dist = Math.sqrt(x * x + z * z);
        
        x += Math.cos(angle) * delta * speed * 0.3;
        z += Math.sin(angle) * delta * speed * 0.3;
        y += Math.sin(time * 3 + i) * delta * 0.5;

        // Reset when too far
        if (dist > spread * 2) {
          x = (Math.random() - 0.5) * spread * 0.2;
          y = (Math.random() - 0.5) * spread * 0.2;
          z = (Math.random() - 0.5) * spread * 0.2;
        }
      } else if (type === "trail") {
        // Spiral trail effect
        y -= delta * speed;
        const spiralSpeed = 2;
        x = Math.sin(time * spiralSpeed + i * 0.5) * spread * (1 + y * 0.2);
        z = Math.cos(time * spiralSpeed + i * 0.5) * spread * (1 + y * 0.2);

        if (y < -2) {
          y = 0;
        }
      }

      (positionAttr.array as Float32Array)[i * 3] = x;
      (positionAttr.array as Float32Array)[i * 3 + 1] = y;
      (positionAttr.array as Float32Array)[i * 3 + 2] = z;

      // Animate sizes for twinkle effect
      if (type === "sparkle") {
        (sizeAttr.array as Float32Array)[i] = size * (0.5 + Math.sin(time * 10 + i) * 0.5);
      }
    }

    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

export default Particles;
