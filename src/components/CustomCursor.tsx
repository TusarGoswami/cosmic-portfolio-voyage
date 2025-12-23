import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Main cursor - rocket/crosshair style */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      >
        <div className="relative w-6 h-6">
          {/* Crosshair design */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-foreground rounded-full" />
          </div>
          <div className="absolute top-1/2 left-0 w-1.5 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-1.5 h-0.5 bg-foreground -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-foreground -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-1.5 bg-foreground -translate-x-1/2" />
          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-foreground rounded-full -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: isHovering ? [1, 1.5, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isHovering ? Infinity : 0,
            }}
          />
        </div>
      </motion.div>

      {/* Trailing glow */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.8,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-accent/20 blur-md" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
