import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const duration = 1200; // 1.2 seconds count-up
    const startTime = performance.now();

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(onComplete, 800); // Allow wipe up transition to complete
        }, 150);
      }
    };

    const animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: { ease: [0.85, 0, 0.15, 1], duration: 0.8 },
          }}
          className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden"
        >
          {/* Top Row: System Identity */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#0A0A0C]">
                AURA
              </span>
              <span className="font-mono text-[10px] uppercase text-[#71717A] tracking-wider">
                [ALTERNATIVE CREDIT OS // V1.4]
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#52525B] uppercase hidden sm:block">
              INITIALIZING TELEMETRY KERNEL...
            </div>
          </div>

          {/* Center: Pulsing Electric Blue Hairline Expansion */}
          <div className="relative w-full py-8">
            <div className="w-full bg-[#E4E4E7] h-[2px] relative overflow-hidden">
              <motion.div
                className="h-full bg-[#0029FF]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#71717A] mt-3 uppercase tracking-widest">
              <span>UPI &bull; TELECOM &bull; GST FLOWS</span>
              <span>150-TREE GRADIENT BOOSTER</span>
            </div>
          </div>

          {/* Bottom Row: Dynamic Numerical Counter */}
          <div className="flex items-end justify-between border-t border-[#E4E4E7] pt-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#71717A] tracking-widest block">
                SYSTEM CALIBRATION
              </span>
              <span className="font-mono text-xs text-[#0A0A0C] font-semibold">
                TREESHAP MATRIX READY
              </span>
            </div>

            {/* Huge bold count-up number */}
            <div className="font-mono text-6xl sm:text-8xl lg:text-9xl font-extrabold tracking-tighter text-[#0A0A0C] leading-none">
              {progress}
              <span className="text-2xl sm:text-4xl lg:text-5xl text-[#0029FF] ml-1 font-bold">
                %
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
