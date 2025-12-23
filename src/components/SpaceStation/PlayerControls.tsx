import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerControlsProps {
  enabled: boolean;
}

const PlayerControls = ({ enabled }: PlayerControlsProps) => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
  });

  const friction = 0.95;
  const acceleration = 0.008;
  const maxSpeed = 0.15;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    const key = e.key.toLowerCase();
    if (key === "w") keys.current.w = true;
    if (key === "a") keys.current.a = true;
    if (key === "s") keys.current.s = true;
    if (key === "d") keys.current.d = true;
    if (key === " ") keys.current.space = true;
    if (key === "shift") keys.current.shift = true;
  }, [enabled]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === "w") keys.current.w = false;
    if (key === "a") keys.current.a = false;
    if (key === "s") keys.current.s = false;
    if (key === "d") keys.current.d = false;
    if (key === " ") keys.current.space = false;
    if (key === "shift") keys.current.shift = false;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame(() => {
    if (!enabled) return;

    // Apply acceleration based on key presses
    if (keys.current.w) velocity.current.z -= acceleration;
    if (keys.current.s) velocity.current.z += acceleration;
    if (keys.current.a) velocity.current.x -= acceleration;
    if (keys.current.d) velocity.current.x += acceleration;
    if (keys.current.space) velocity.current.y += acceleration;
    if (keys.current.shift) velocity.current.y -= acceleration;

    // Clamp velocity
    velocity.current.clampLength(0, maxSpeed);

    // Apply friction
    velocity.current.multiplyScalar(friction);

    // Update camera position
    camera.position.add(velocity.current);

    // Clamp position to corridor bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2, 2);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -1.5, 2);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -6, 5);

    // Subtle floating bob effect
    camera.position.y += Math.sin(Date.now() * 0.001) * 0.001;
  });

  return null;
};

export default PlayerControls;
