import React from "react";
import { motion } from "framer-motion";
import type {
  BorrowerProfile,
  CreditScoreResponse,
  PersonaPreset,
} from "../types/credit";
import { CompactPresetSelector } from "../components/CompactPresetSelector";
import { TelemetryForm } from "../components/TelemetryForm";
import { VerdictHero } from "../components/VerdictHero";
import { KnockoutAlert } from "../components/KnockoutAlert";
import { DecisionTabs } from "../components/DecisionTabs";
import { ShieldCheck, Zap, ServerCrash, ArrowLeft } from "lucide-react";

interface UnderwritingConsoleProps {
  profile: BorrowerProfile;
  onChangeProfile: (profile: BorrowerProfile) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: PersonaPreset) => void;
  decision: CreditScoreResponse | null;
  latencyMs?: number;
  isSimulated: boolean;
  isLoading: boolean;
  onEvaluate: () => void;
  backendOnline: boolean;
  onSwitchToSimulation: () => void;
  errorMessage: string | null;
  pulsingFields: Set<keyof BorrowerProfile>;
  onNavigateToOverview: () => void;
}

export const UnderwritingConsole: React.FC<UnderwritingConsoleProps> = ({
  profile,
  onChangeProfile,
  selectedPresetId,
  onSelectPreset,
  decision,
  latencyMs,
  isSimulated,
  isLoading,
  onEvaluate,
  backendOnline,
  onSwitchToSimulation,
  errorMessage,
  pulsingFields,
  onNavigateToOverview,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6"
    >
      {/* Top Bar with Minimal Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E4E7]">
        <button
          onClick={onNavigateToOverview}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-[#52525B] hover:text-[#0029FF] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>&larr; BACK TO PRODUCT STORY &amp; BENCHMARKS</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#52525B]">
          <span>ENGINE STATUS:</span>
          <span
            className={`font-bold uppercase ${
              backendOnline ? "text-[#0029FF]" : "text-amber-600"
            }`}
          >
            {backendOnline ? "FASTAPI 8000 LIVE" : "CLIENT SIMULATION"}
          </span>
        </div>
      </div>

      {/* Offline Notice */}
      {!backendOnline && !isSimulated && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ServerCrash className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold uppercase">
                [ FASTAPI SCORING SERVER OFFLINE ON :8000 ]
              </span>
              <p className="text-[11px] text-amber-800 m-0">
                Run <code>uvicorn src.main:app --port 8000</code> or continue in simulation mode.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToSimulation}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold uppercase text-xs cursor-pointer"
          >
            SWITCH TO SIMULATION
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono flex items-center justify-between gap-3">
          <div>
            <span className="font-bold uppercase">[ API REQUEST ERROR ]:</span>
            <span className="ml-1.5">{errorMessage}</span>
          </div>
          <button
            onClick={onSwitchToSimulation}
            className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold uppercase cursor-pointer"
          >
            RUN SIMULATED
          </button>
        </div>
      )}

      {/* 1. Compact Preset Selector */}
      <CompactPresetSelector
        selectedPresetId={selectedPresetId}
        onSelectPreset={onSelectPreset}
      />

      {/* 2. Asymmetrical 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Telemetry Form (5 of 12 cols) */}
        <div className="lg:col-span-5 w-full">
          <TelemetryForm
            profile={profile}
            onChange={onChangeProfile}
            onSubmit={onEvaluate}
            isLoading={isLoading}
            pulsingFields={pulsingFields}
          />
        </div>

        {/* Right: Decision Engine & Explainability (7 of 12 cols) */}
        <div className="lg:col-span-7 w-full space-y-5">
          {decision ? (
            <>
              <KnockoutAlert knockoutReason={decision.knockout_reason} />
              <VerdictHero
                decision={decision}
                latencyMs={latencyMs}
                isSimulated={isSimulated}
              />
              <DecisionTabs profile={profile} decision={decision} />
            </>
          ) : (
            <div className="bg-white border border-[#E4E4E7] p-10 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
              <div className="w-12 h-12 bg-[#F4F4F6] border border-[#E4E4E7] text-[#0029FF] flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0A0A0C] mb-1 font-mono uppercase">
                [ READY FOR UNDERWRITING EVALUATION ]
              </h3>
              <p className="text-xs text-[#52525B] max-w-sm mb-5 leading-relaxed font-sans">
                Adjust the telemetry values in the left panel or select an archetype preset, then click Evaluate Application.
              </p>
              <button
                onClick={onEvaluate}
                className="px-5 py-2.5 bg-[#0029FF] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EVALUATE CURRENT INPUTS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
