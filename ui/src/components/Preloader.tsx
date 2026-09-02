import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [isReadyToExit, setIsReadyToExit] = useState(false);

  useEffect(() => {
    // Deterministic tick interval: hits 100% smoothly in ~1.5s
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Consistent increments that reliably land on 100
        const step = Math.floor(Math.random() * 4) + 3;
        const next = prev + step;
        return next >= 100 ? 100 : next;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  // When percent reaches exactly 100, pause briefly so user sees 100%, then trigger curtain wipe
  useEffect(() => {
    if (percent === 100) {
      const exitTimer = setTimeout(() => {
        setIsReadyToExit(true);
      }, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [percent]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between p-8 md:p-14 bg-[#0A0A0C] text-white select-none pointer-events-none"
      initial={{ y: 0 }}
      animate={isReadyToExit ? { y: "-100%" } : { y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.85, 0, 0.15, 1], // Editorial curtain wipe easing
      }}
      onAnimationComplete={() => {
        if (isReadyToExit) {
          onComplete();
        }
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-mono tracking-widest text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0E7490] animate-pulse" />
          <span>AURA [ALTERNATIVE CREDIT OS // V1.4]</span>
        </div>
        <span>INITIALIZING TELEMETRY KERNEL...</span>
      </div>

      {/* Middle Hairline Progress */}
      <div className="w-full relative">
        <div className="h-[1px] w-full bg-zinc-800 relative overflow-hidden">
          <div
            className="h-full bg-[#0E7490] transition-all duration-75 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-3 tracking-wider">
          <span>UPI • TELECOM • GST FLOWS</span>
          <span>150-TREE GRADIENT BOOSTER</span>
        </div>
      </div>

      {/* Bottom Counter */}
      <div className="flex justify-between items-end">
        <div className="text-[11px] font-mono tracking-widest text-zinc-400">
          SYSTEM CALIBRATION<br />
          <span className="text-white font-bold">TREESHAP MATRIX READY</span>
        </div>

        {/* Counter Display: Strictly shows 100% before sliding */}
        <div className="text-8xl md:text-9xl font-mono font-bold tracking-tighter text-white tabular-nums flex items-baseline">
          <span>{percent}</span>
          <span className="text-[#0E7490] text-5xl md:text-6xl ml-1">%</span>
        </div>
      </div>
    </motion.div>
  );
};
