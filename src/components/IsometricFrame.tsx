import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface IsometricFrameProps {
  isLoading: boolean;
  onLoadingComplete: () => void;
  onStart: () => void;
}

const IsometricFrame = ({ isLoading, onLoadingComplete, onStart }: IsometricFrameProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const duration = 3000; // 3 seconds loading
      const interval = 50;
      const increment = 100 / (duration / interval);

      const timer = setInterval(() => {
        setLoadingProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(timer);
            setTimeout(onLoadingComplete, 200);
            return 100;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isLoading, onLoadingComplete]);

  // SVG path for the parallelogram border (draw animation)
  const parallelogramPath = "M 40 0 L 260 0 L 220 100 L 0 100 Z";
  const pathLength = 720; // Approximate path length

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer frame container with skew */}
      <div
        className="relative"
        style={{
          transform: "perspective(1000px) rotateX(5deg) rotateY(-5deg)",
        }}
      >
        {/* Main frame */}
        <div className="relative w-[280px] h-[120px]">
          {/* SVG for border draw animation */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 260 100"
            preserveAspectRatio="none"
          >
            {/* Outer border */}
            <motion.path
              d={parallelogramPath}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: loadingProgress / 100 }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength * (1 - loadingProgress / 100),
              }}
            />
            
            {/* Inner border (slightly smaller) */}
            <motion.path
              d="M 48 8 L 252 8 L 216 92 L 8 92 Z"
              fill="none"
              stroke="hsl(var(--foreground) / 0.5)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: loadingProgress / 100 }}
              transition={{ duration: 0.1, ease: "linear", delay: 0.1 }}
            />
          </svg>

          {/* Content area */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
            }}
          >
            {isLoading ? (
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="text-foreground text-xl font-bold tracking-[0.3em] uppercase"
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Loading
                </motion.span>
                <span className="text-muted-foreground text-sm">
                  {Math.floor(loadingProgress)}%
                </span>
              </motion.div>
            ) : (
              <motion.button
                onClick={onStart}
                className="group relative px-8 py-3 text-foreground text-2xl font-bold tracking-[0.4em] uppercase transition-all duration-300 hover:text-accent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start</span>
                
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300"
                  style={{
                    clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
                  }}
                />
              </motion.button>
            )}
          </div>
        </div>

        {/* Corner accents */}
        <motion.div
          className="absolute -top-1 left-[15%] w-3 h-3 border-t-2 border-l-2 border-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingProgress > 20 ? 1 : 0 }}
        />
        <motion.div
          className="absolute -top-1 right-0 w-3 h-3 border-t-2 border-r-2 border-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingProgress > 40 ? 1 : 0 }}
        />
        <motion.div
          className="absolute -bottom-1 left-0 w-3 h-3 border-b-2 border-l-2 border-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingProgress > 60 ? 1 : 0 }}
        />
        <motion.div
          className="absolute -bottom-1 right-[15%] w-3 h-3 border-b-2 border-r-2 border-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadingProgress > 80 ? 1 : 0 }}
        />
      </div>
    </motion.div>
  );
};

export default IsometricFrame;
