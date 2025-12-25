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
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Animated loading text with gradient */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.span
                    className="text-2xl font-bold tracking-[0.4em] uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    Loading
                  </motion.span>
                  {/* Glow behind text */}
                  <motion.div
                    className="absolute inset-0 blur-lg bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30 -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                
                {/* Progress bar */}
                <div className="w-32 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                
                <motion.span 
                  className="text-muted-foreground text-sm font-mono"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  {Math.floor(loadingProgress)}%
                </motion.span>
              </motion.div>
            ) : (
              <motion.button
                onClick={onStart}
                className="group relative px-10 py-4 overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                />
                
                {/* Border glow */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-cyan-400/50 group-hover:border-cyan-400"
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(34, 211, 238, 0.1)",
                      "0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 15px rgba(168, 85, 247, 0.2)",
                      "0 0 10px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.1)",
                      "0 0 10px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(34, 211, 238, 0.1)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Text with gradient */}
                <motion.span
                  className="relative z-10 text-2xl font-bold tracking-[0.5em] uppercase bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(34, 211, 238, 0.5)",
                      "0 0 20px rgba(168, 85, 247, 0.6)",
                      "0 0 10px rgba(236, 72, 153, 0.5)",
                      "0 0 10px rgba(34, 211, 238, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  Start
                </motion.span>
                
                {/* Sparkle effects on hover */}
                <motion.div
                  className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="absolute bottom-2 left-3 w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.3,
                  }}
                />
                <motion.div
                  className="absolute top-3 left-6 w-0.5 h-0.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.6,
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
