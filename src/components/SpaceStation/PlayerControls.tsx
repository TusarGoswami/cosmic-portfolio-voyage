import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerControlsProps {
  enabled: boolean;
}

const PlayerControls = ({ enabled }: PlayerControlsProps) => {
  const { camera, gl } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const [isLocked, setIsLocked] = useState(false);
  
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
  const mouseSensitivity = 0.002;

  // Handle pointer lock
  const handleClick = useCallback(() => {
    if (enabled && !isLocked) {
      gl.domElement.requestPointerLock();
    }
  }, [enabled, isLocked, gl]);

  const handleLockChange = useCallback(() => {
    setIsLocked(document.pointerLockElement === gl.domElement);
  }, [gl]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || !isLocked) return;
    
    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y -= e.movementX * mouseSensitivity;
    euler.current.x -= e.movementY * mouseSensitivity;
    
    // Clamp vertical rotation
    euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
    
    camera.quaternion.setFromEuler(euler.current);
  }, [enabled, isLocked, camera]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    const key = e.key.toLowerCase();
    if (key === "w") keys.current.w = true;
    if (key === "a") keys.current.a = true;
    if (key === "s") keys.current.s = true;
    if (key === "d") keys.current.d = true;
    if (key === " ") keys.current.space = true;
    if (key === "shift") keys.current.shift = true;
    if (key === "escape") {
      document.exitPointerLock();
    }
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
    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handleLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      gl.domElement.removeEventListener("click", handleClick);
      document.removeEventListener("pointerlockchange", handleLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleClick, handleLockChange, handleMouseMove, handleKeyDown, handleKeyUp, gl]);

  useFrame(() => {
    if (!enabled) return;

    // Get camera direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    // Zero out Y component for horizontal movement
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();

    // Apply acceleration based on key presses
    if (keys.current.w) {
      velocity.current.add(forward.multiplyScalar(acceleration));
    }
    if (keys.current.s) {
      velocity.current.add(forward.multiplyScalar(-acceleration));
    }
    if (keys.current.a) {
      velocity.current.add(right.multiplyScalar(-acceleration));
    }
    if (keys.current.d) {
      velocity.current.add(right.multiplyScalar(acceleration));
    }
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
    camera.position.y += Math.sin(Date.now() * 0.001) * 0.0005;
  });

  return null;
};

export default PlayerControls;
