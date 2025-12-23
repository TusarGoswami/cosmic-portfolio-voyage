import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import CustomCursor from "@/components/CustomCursor";
import IsometricFrame from "@/components/IsometricFrame";
import { useParallax } from "@/hooks/useParallax";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const parallax = useParallax(15);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleStart = useCallback(() => {
    setHasStarted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden space-cursor">
      {/* Custom cursor */}
      <CustomCursor />

      {/* Animated star field background */}
      <StarField />

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      {/* Main content with parallax */}
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="start-screen"
            className="relative z-10 flex min-h-screen items-center justify-center"
            style={{
              transform: `perspective(1000px) rotateX(${parallax.rotateX}deg) rotateY(${parallax.rotateY}deg)`,
            }}
            exit={{
              opacity: 0,
              scale: 1.5,
              filter: "blur(20px)",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Parallax container */}
            <motion.div
              animate={{
                x: parallax.x,
                y: parallax.y,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 30,
              }}
            >
              <IsometricFrame
                isLoading={isLoading}
                onLoadingComplete={handleLoadingComplete}
                onStart={handleStart}
              />
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full blur-sm"
              animate={{
                x: parallax.x * 2,
                y: parallax.y * 2,
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                opacity: { duration: 2, repeat: Infinity },
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-space-glow rounded-full blur-md"
              animate={{
                x: parallax.x * -1.5,
                y: parallax.y * -1.5,
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                opacity: { duration: 3, repeat: Infinity },
              }}
            />
            <motion.div
              className="absolute top-1/3 right-1/3 w-1 h-1 bg-space-star rounded-full"
              animate={{
                x: parallax.x * 1.2,
                y: parallax.y * 1.2,
                scale: [1, 1.5, 1],
              }}
              transition={{
                scale: { duration: 2.5, repeat: Infinity },
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            className="relative z-10 flex min-h-screen items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-foreground mb-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome to the Universe
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Phase 2: Space Station coming soon...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
