import React from "react";
import {
  ShieldCheck,
  Server,
  Activity,
  RotateCcw,
  History,
  Zap,
} from "lucide-react";

interface HeaderProps {
  backendOnline: boolean;
  backendLatency: number;
  isSimulated: boolean;
  onToggleSimulation: (val: boolean) => void;
  onResetDefaults: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  onCheckHealth: () => void;
  checkingHealth: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  backendOnline,
  backendLatency,
  isSimulated,
  onToggleSimulation,
  onResetDefaults,
  historyCount,
  onOpenHistory,
  onCheckHealth,
  checkingHealth,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-indigo-400/30">
            <ShieldCheck className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#09090b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white m-0 flex items-center gap-1.5">
                AURA
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 tracking-wider">
                  v1.0 Engine
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 m-0">
              Alternative Data Credit Underwriting &amp; SHAP Decisioning Hub
            </p>
          </div>
        </div>

        {/* Global Controls & Backend Telemetry */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Backend Health Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              backendOnline
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                : "bg-amber-950/20 border-amber-500/30 text-amber-400"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {backendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 opacity-70" />
              <span>
                {backendOnline
                  ? `FastAPI:8000 (${backendLatency}ms)`
                  : "Backend Offline"}
              </span>
            </div>
            <button
              onClick={onCheckHealth}
              disabled={checkingHealth}
              title="Ping Backend Health"
              className="ml-1 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <Activity
                className={`w-3.5 h-3.5 ${checkingHealth ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Engine Simulation Switch */}
          <button
            onClick={() => onToggleSimulation(!isSimulated)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isSimulated
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                : "bg-[#18181b] text-zinc-400 border-[#27272a] hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulated ? "text-indigo-400" : ""}`} />
            <span>
              {isSimulated ? "Mode: Simulated" : "Mode: Live FastAPI"}
            </span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18181b] text-zinc-300 border border-[#27272a] hover:bg-[#27272a] hover:text-white transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Defaults */}
          <button
            onClick={onResetDefaults}
            title="Reset telemetry to baseline"
            className="p-1.5 rounded-lg text-zinc-400 bg-[#18181b] border border-[#27272a] hover:text-zinc-200 hover:bg-[#27272a] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
