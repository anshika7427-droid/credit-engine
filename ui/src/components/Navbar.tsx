import React from "react";
import {
  ShieldCheck,
  Server,
  Activity,
  RotateCcw,
  History,
  Zap,
  ArrowRight,
  LayoutDashboard,
  Compass,
} from "lucide-react";

export type ActiveView = "landing" | "console";

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
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

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-colors">
              <ShieldCheck className="w-5 h-5" />
              <div
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  backendOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  AURA
                </span>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Alternative Data Underwriting Engine
              </p>
            </div>
          </button>

          {/* Primary View Switcher */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => onNavigate("landing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === "landing"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => onNavigate("console")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === "console"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
          </nav>
        </div>

        {/* Global Controls & Backend Status */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Backend Health Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              backendOnline
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {backendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendOnline ? "bg-emerald-600" : "bg-amber-600"
                }`}
              ></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 opacity-70" />
              <span className="hidden sm:inline font-mono">
                {backendOnline
                  ? `FastAPI: 8000 (${backendLatency}ms)`
                  : "Backend Offline"}
              </span>
              <span className="sm:hidden font-mono">
                {backendOnline ? ":8000" : "Offline"}
              </span>
            </div>
            <button
              onClick={onCheckHealth}
              disabled={checkingHealth}
              title="Ping Backend Health"
              className="hover:text-slate-950 transition-colors cursor-pointer ml-0.5"
            >
              <Activity
                className={`w-3.5 h-3.5 ${checkingHealth ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => onToggleSimulation(!isSimulated)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isSimulated
                ? "bg-slate-100 text-slate-800 border-slate-300 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulated ? "text-amber-600" : "text-slate-400"}`} />
            <span className="hidden md:inline">
              {isSimulated ? "Mode: Simulated" : "Mode: Live FastAPI"}
            </span>
            <span className="md:hidden">
              {isSimulated ? "Sim" : "Live"}
            </span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            title="Evaluation History"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Defaults (Console View) */}
          {activeView === "console" && (
            <button
              onClick={onResetDefaults}
              title="Reset telemetry to baseline"
              className="p-1.5 rounded-lg text-slate-500 bg-white border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Launch Console CTA (Landing Page View) */}
          {activeView === "landing" && (
            <button
              onClick={() => onNavigate("console")}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden items-center justify-center pt-2.5 mt-2 border-t border-slate-200">
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs w-full max-w-xs justify-around">
          <button
            onClick={() => onNavigate("landing")}
            className={`flex-1 py-1 rounded-lg font-medium text-center transition-all ${
              activeView === "landing"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate("console")}
            className={`flex-1 py-1 rounded-lg font-medium text-center transition-all ${
              activeView === "console"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600"
            }`}
          >
            Console
          </button>
        </div>
      </div>
    </header>
  );
};
