import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import CustomCursor from "@/components/CustomCursor";
import IsometricFrame from "@/components/IsometricFrame";
import { useParallax } from "@/hooks/useParallax";
import ExitChoices from "@/components/ExitChoices";
import GalaxyExploration from "@/components/GalaxyExploration";
import LaunchTransition from "@/components/LaunchTransition";

type GamePhase = "loading" | "start" | "choose" | "launching" | "space";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [selectedVehicle, setSelectedVehicle] = useState<"rocket" | "astronaut" | null>(null);
  const parallax = useParallax(15);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    setPhase("start");
  }, []);

  const handleStart = useCallback(() => {
    setPhase("choose");
  }, []);

  const handleSelect = useCallback((vehicle: "rocket" | "astronaut") => {
    setSelectedVehicle(vehicle);
    setPhase("space");
  }, []);

  const handleLaunchComplete = useCallback(() => {
    setPhase("space");
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden space-cursor">
      <CustomCursor />

      <AnimatePresence mode="wait">
        {(phase === "loading" || phase === "start") && (
          <motion.div
            key="start-screen"
            className="relative z-10 min-h-screen"
            exit={{
              opacity: 0,
              scale: 1.5,
              filter: "blur(20px)",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <StarField />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

            <motion.div
              className="relative z-10 flex min-h-screen items-center justify-center"
              style={{
                transform: `perspective(1000px) rotateX(${parallax.rotateX}deg) rotateY(${parallax.rotateY}deg)`,
              }}
            >
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
          </motion.div>
        )}

        {phase === "choose" && (
          <motion.div
            key="choose"
            className="relative z-10 w-full h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ExitChoices onSelect={handleSelect} />
          </motion.div>
        )}

        {phase === "launching" && selectedVehicle && (
          <LaunchTransition 
            key="launching"
            vehicle={selectedVehicle} 
            onComplete={handleLaunchComplete} 
          />
        )}

        {phase === "space" && selectedVehicle && (
          <motion.div
            key="space"
            className="relative z-10 w-full h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <GalaxyExploration vehicle={selectedVehicle} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
