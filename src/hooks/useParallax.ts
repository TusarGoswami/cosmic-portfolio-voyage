import { useEffect, useState } from "react";

interface ParallaxPosition {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

export const useParallax = (intensity: number = 20) => {
  const [position, setPosition] = useState<ParallaxPosition>({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate position relative to center (-0.5 to 0.5)
      const xRatio = (clientX / innerWidth - 0.5) * 2;
      const yRatio = (clientY / innerHeight - 0.5) * 2;

      setPosition({
        x: xRatio * intensity,
        y: yRatio * intensity,
        rotateX: -yRatio * (intensity / 2),
        rotateY: xRatio * (intensity / 2),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [intensity]);

  return position;
};
