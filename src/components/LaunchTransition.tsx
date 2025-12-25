import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LaunchTransitionProps {
  vehicle: "rocket" | "astronaut";
  onComplete: () => void;
}

const LaunchTransition = ({ vehicle, onComplete }: LaunchTransitionProps) => {
  const [phase, setPhase] = useState<"countdown" | "launch" | "warp" | "exit">("countdown");
  const [count, setCount] = useState(3);

  useEffect(() => {
    // Countdown phase
    if (phase === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 600);
      return () => clearTimeout(timer);
    }
    
    if (phase === "countdown" && count === 0) {
      setPhase("launch");
      setTimeout(() => setPhase("warp"), 800);
      setTimeout(() => setPhase("exit"), 2200);
      setTimeout(onComplete, 2800);
    }
  }, [phase, count, onComplete]);

  const isRocket = vehicle === "rocket";
  const accentColor = isRocket ? "#00ffaa" : "#ff6699";
  const vehicleEmoji = isRocket ? "🚀" : "🧑‍🚀";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#030308]">
      {/* Background stars that stretch during warp */}
      <motion.div 
        className="absolute inset-0"
        animate={phase === "warp" || phase === "exit" ? {
          scale: [1, 3],
        } : {}}
        transition={{ duration: 1.5, ease: "easeIn" }}
      >
        {Array.from({ length: 200 }).map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 2 + 1;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
              }}
              animate={phase === "warp" || phase === "exit" ? {
                scaleY: [1, 50, 100],
                opacity: [0.8, 1, 0],
                y: y > 50 ? [0, 200, 500] : [0, -200, -500],
              } : {
                opacity: [0.3, 1, 0.3],
              }}
              transition={phase === "warp" || phase === "exit" ? {
                duration: 1.5,
                ease: "easeIn",
              } : {
                duration: 1 + Math.random() * 2,
                repeat: Infinity,
              }}
            />
          );
        })}
      </motion.div>

      {/* Radial warp tunnel */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={phase === "warp" || phase === "exit" ? {
          opacity: [0, 1, 0.5],
        } : {}}
        transition={{ duration: 1.5 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              borderColor: i % 2 === 0 ? accentColor : "#4fc3f7",
              width: 100 + i * 150,
              height: 100 + i * 150,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={phase === "warp" || phase === "exit" ? {
              opacity: [0, 0.6, 0],
              scale: [0.5, 2, 4],
            } : {}}
            transition={{
              duration: 1.2,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* Central light flash */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={phase === "launch" || phase === "warp" ? {
          opacity: [0, 1, 0],
        } : {}}
        transition={{ duration: 0.8 }}
      >
        <div 
          className="w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: accentColor }}
        />
      </motion.div>

      {/* Countdown display */}
      {phase === "countdown" && count > 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span 
            className="text-9xl font-bold"
            style={{ color: accentColor, textShadow: `0 0 60px ${accentColor}` }}
          >
            {count}
          </span>
        </motion.div>
      )}

      {/* Launch text */}
      {phase === "countdown" && count === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span 
            className="text-6xl md:text-8xl font-bold tracking-widest"
            style={{ color: accentColor, textShadow: `0 0 60px ${accentColor}` }}
          >
            LAUNCH!
          </span>
        </motion.div>
      )}

      {/* Vehicle icon zooming through */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 1, y: 0 }}
        animate={phase === "launch" ? {
          scale: [1, 0.5],
          y: [0, -50],
        } : phase === "warp" || phase === "exit" ? {
          scale: [0.5, 0.1, 0],
          y: [-50, -200, -400],
          opacity: [1, 1, 0],
        } : {}}
        transition={{ duration: phase === "launch" ? 0.8 : 1.5, ease: "easeIn" }}
      >
        <span className="text-8xl">{vehicleEmoji}</span>
      </motion.div>

      {/* Speed lines from center */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={phase === "warp" || phase === "exit" ? { opacity: 1 } : {}}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360;
          return (
            <motion.div
              key={i}
              className="absolute h-1 origin-left"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                transform: `rotate(${angle}deg)`,
                width: 0,
              }}
              animate={phase === "warp" || phase === "exit" ? {
                width: ["0%", "60%", "100%"],
                opacity: [0, 1, 0],
              } : {}}
              transition={{
                duration: 1.2,
                delay: i * 0.02,
                ease: "easeIn",
              }}
            />
          );
        })}
      </motion.div>

      {/* Vignette overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, transparent 30%, rgba(0,0,0,0.8) 100%)`,
        }}
        animate={phase === "warp" || phase === "exit" ? {
          opacity: [1, 0.5, 0],
        } : {}}
        transition={{ duration: 1.5 }}
      />

      {/* Final white flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={phase === "exit" ? {
          opacity: [0, 0, 1],
        } : {}}
        transition={{ duration: 1.5, times: [0, 0.7, 1] }}
      />

      {/* Status text at bottom */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "countdown" ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-muted-foreground text-lg tracking-widest uppercase">
          {isRocket ? "Initializing Rocket Systems" : "Preparing EVA Suit"}
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LaunchTransition;