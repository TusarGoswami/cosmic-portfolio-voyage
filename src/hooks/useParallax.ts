import { useEffect, useRef } from "react";

export const useParallax = (_intensity: number = 20) => {
  const posRef = useRef({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // No setState — no re-render, zero lag
      posRef.current = { x: 0, y: 0, rotateX: 0, rotateY: 0 };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return posRef.current;
};
