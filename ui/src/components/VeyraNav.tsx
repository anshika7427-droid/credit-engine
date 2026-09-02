import React from "react";
import { Activity, History } from "lucide-react";
import { scrollWithLenis } from "../hooks/useSmoothScroll";

export type ActiveView = "landing" | "console";

interface VeyraNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  backendOnline: boolean;
  backendLatency: number;
  historyCount: number;
  onOpenHistory: () => void;
  onCheckHealth: () => void;
  checkingHealth: boolean;
  navTheme?: "light" | "dark";
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
  navTheme = "light",
}) => {
  const scrollTo = (id: string) => {
    if (activeView !== "landing") {
      onNavigate("landing");
      setTimeout(() => {
        scrollWithLenis(`#${id}`, { offset: -65 });
      }, 120);
    } else {
      scrollWithLenis(`#${id}`, { offset: -65 });
    }
  };

  const isDark = navTheme === "dark";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 px-4 lg:px-8 py-3.5 backdrop-blur-md ${
        isDark
          ? "bg-[#0A0A0C]/90 border-b border-white/10 text-white"
          : "bg-white/90 border-b border-[#E4E4E7] text-[#0A0A0C]"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brandmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeView !== "landing") onNavigate("landing");
              scrollWithLenis(0, { duration: 0.8 });
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 bg-[#0029FF] text-white font-mono font-bold text-xs flex items-center justify-center tracking-tighter shadow-sm">
              AU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-base font-extrabold tracking-tight transition-colors ${
                    isDark ? "text-white" : "text-[#0A0A0C]"
                  }`}
                >
                  AURA
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider transition-colors hidden sm:inline ${
                    isDark ? "text-white/60" : "text-[#71717A]"
                  }`}
                >
                  [ALTERNATIVE CREDIT OS]
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Segmented Nav Pills */}
        <nav
          className={`hidden md:flex items-center gap-1 p-1 rounded-full border text-xs font-mono transition-colors ${
            isDark
              ? "border-white/20 bg-white/10"
              : "border-[#E4E4E7] bg-[#F4F4F6]"
          }`}
        >
          <button
            onClick={() => {
              if (activeView !== "landing") onNavigate("landing");
              scrollWithLenis(0, { duration: 0.8 });
            }}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              activeView === "landing"
                ? isDark
                  ? "bg-white text-black shadow-sm"
                  : "bg-[#0A0A0C] text-white shadow-sm"
                : isDark
                ? "text-white/70 hover:text-white"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            }`}
          >
            Engine
          </button>

          <button
            onClick={() => scrollTo("page-personas")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isDark
                ? "text-white/70 hover:text-white"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            }`}
          >
            Personas
          </button>

          <button
            onClick={() => scrollTo("page-monolith")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isDark
                ? "text-white/70 hover:text-white"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            }`}
          >
            Pipeline
          </button>

          <button
            onClick={() => scrollTo("page-matrix")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isDark
                ? "text-white/70 hover:text-white"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            }`}
          >
            Impact Matrix
          </button>
        </nav>

        {/* Right: Latency Tag + Launch Console CTA */}
        <div className="flex items-center gap-3">
          {/* Latency Tag */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 border text-[11px] font-mono transition-colors ${
              isDark
                ? "bg-white/10 border-white/20 text-white/90"
                : "bg-[#F4F4F6] border-[#E4E4E7] text-[#52525B]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendOnline ? "bg-[#0029FF]" : "bg-amber-500"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline ? "bg-[#0029FF]" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="hidden sm:inline uppercase">
              {backendOnline
                ? `● FASTAPI 8000 (${backendLatency || 14}MS)`
                : "● ENGINE: SIMULATED (14MS)"}
            </span>
            <span className="sm:hidden uppercase font-mono">
              :8000
            </span>
            <button
              onClick={onCheckHealth}
              disabled={checkingHealth}
              title="Ping Backend Health"
              className="hover:opacity-75 transition-opacity cursor-pointer ml-0.5"
            >
              <Activity
                className={`w-3 h-3 ${checkingHealth ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            title="Evaluation History"
            className={`p-2 border transition-colors cursor-pointer relative ${
              isDark
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                : "bg-[#F4F4F6] border-[#E4E4E7] text-slate-700 hover:text-black hover:bg-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 bg-[#0029FF] text-white text-[9px] font-mono font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* High-Contrast Action Button to Switch to Console */}
          <button
            onClick={() => onNavigate("console")}
            className={`font-mono font-semibold text-xs tracking-wider uppercase px-5 sm:px-6 py-2.5 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isDark
                ? "bg-white text-black hover:bg-[#0029FF] hover:text-white"
                : "bg-[#0029FF] text-white hover:bg-black"
            }`}
          >
            <span>{activeView === "console" ? "WORKSPACE ACTIVE" : "LAUNCH CONSOLE ↗"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
