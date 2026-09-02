import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Activity, History } from "lucide-react";
import { scrollWithLenis } from "../hooks/useSmoothScroll";

export type ActiveView = "landing" | "console";

interface VeyraNavProps {
  activeView?: ActiveView;
  onNavigate?: (view: ActiveView) => void;
  backendOnline: boolean;
  backendLatency: number;
  historyCount: number;
  onOpenHistory: () => void;
  onCheckHealth: () => void;
  checkingHealth: boolean;
  navTheme?: "light" | "dark";
  currentView?: ActiveView;
  setCurrentView?: (view: ActiveView) => void;
  scrollTo?: (id: string) => void;
}

export const VeyraNav: React.FC<VeyraNavProps> = ({
  activeView,
  onNavigate,
  backendOnline,
  backendLatency,
  historyCount,
  onOpenHistory,
  onCheckHealth,
  checkingHealth,
  currentView,
  setCurrentView,
  scrollTo: customScrollTo,
}) => {
  const currentActiveView = activeView ?? currentView ?? "landing";
  const navigate = onNavigate ?? setCurrentView ?? (() => {});

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Always show near the top
    if (latest < 50) {
      setHidden(false);
    } 
    // Hide when scrolling down, show when scrolling up
    else if (latest > previous && latest > 80) {
      setHidden(true);
    } else if (latest < previous) {
      setHidden(false);
    }
  });

  const scrollTo = (id: string) => {
    if (customScrollTo) {
      customScrollTo(id);
      return;
    }
    if (currentActiveView !== "landing") {
      navigate("landing");
      setTimeout(() => {
        scrollWithLenis(`#${id}`, { offset: -80 });
      }, 120);
    } else {
      scrollWithLenis(`#${id}`, { offset: -80 });
    }
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F4F7F6]/85 backdrop-blur-md border-b border-[#DDE5E5]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          onClick={() => {
            if (currentActiveView !== "landing") navigate("landing");
            scrollWithLenis(0, { duration: 0.8 });
          }}
        >
          <div className="w-8 h-8 rounded bg-[#0E7490] flex items-center justify-center font-bold text-white text-xs shadow-sm">
            AU
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tracking-tight text-[#111E25] text-sm md:text-base">
              AURA
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#4F616B]">
              [ALTERNATIVE CREDIT OS]
            </span>
          </div>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#EBF1F0]/80 border border-[#DDE5E5] rounded-full px-2 py-1.5 backdrop-blur-sm">
          <button
            onClick={() => scrollTo("hero")}
            className={`px-4 py-1 text-xs font-mono tracking-wider rounded-full transition-colors cursor-pointer ${
              currentActiveView === "landing"
                ? "text-white bg-[#111E25] shadow-sm"
                : "text-[#4F616B] hover:text-[#111E25]"
            }`}
          >
            Engine
          </button>
          <button
            onClick={() => scrollTo("personas")}
            className="px-4 py-1 text-xs font-mono tracking-wider text-[#4F616B] hover:text-[#111E25] transition-colors cursor-pointer"
          >
            Personas
          </button>
          <button
            onClick={() => scrollTo("pipeline")}
            className="px-4 py-1 text-xs font-mono tracking-wider text-[#4F616B] hover:text-[#111E25] transition-colors cursor-pointer"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollTo("impact")}
            className="px-4 py-1 text-xs font-mono tracking-wider text-[#4F616B] hover:text-[#111E25] transition-colors cursor-pointer"
          >
            Impact Matrix
          </button>
        </nav>

        {/* Right: Telemetry Ping & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#DDE5E5] bg-white text-[11px] font-mono text-[#4F616B] shadow-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-500" : "bg-amber-500"
              } animate-pulse`}
            />
            <span>
              {backendOnline
                ? `FASTAPI: 8000 (${backendLatency || 14}MS)`
                : "FASTAPI: 8000 (54MS)"}
            </span>
            <button
              onClick={onCheckHealth}
              disabled={checkingHealth}
              title="Ping Backend Health"
              className="hover:opacity-75 transition-opacity cursor-pointer ml-0.5 text-[#4F616B]"
            >
              <Activity
                className={`w-3 h-3 ${checkingHealth ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* History Drawer Button */}
          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              title="Evaluation History"
              className="p-2 border border-[#DDE5E5] bg-white text-[#4F616B] hover:text-[#111E25] rounded-full transition-colors cursor-pointer relative shadow-xs"
            >
              <History className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 px-1 bg-[#0E7490] text-white text-[9px] font-mono font-bold rounded-full">
                {historyCount}
              </span>
            </button>
          )}

          <button
            onClick={() => navigate("console")}
            className="flex items-center gap-2 bg-[#0E7490] hover:bg-[#155E75] text-white text-xs font-mono tracking-wider px-4 md:px-5 py-2 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
          >
            <span>{currentActiveView === "console" ? "WORKSPACE ACTIVE" : "LAUNCH CONSOLE"}</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};
