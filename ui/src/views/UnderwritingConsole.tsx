import React, { useState } from "react";
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
import { AAConsentModal } from "../components/AAConsentModal";
import { ShieldCheck, Zap, ServerCrash, ArrowLeft, Sparkles } from "lucide-react";

interface UnderwritingConsoleProps {
  profile: BorrowerProfile;
  onChangeProfile: (profile: BorrowerProfile) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: PersonaPreset) => void;
  decision: CreditScoreResponse | null;
  latencyMs?: number;
  isSimulated: boolean;
  isLoading: boolean;
  onEvaluate: (overrideProfile?: BorrowerProfile) => void;
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
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const handleConsentSuccess = (synthesized: BorrowerProfile) => {
    onChangeProfile(synthesized);
    // Execute Stage 2 scoring immediately upon successful Stage 1 synthesis
    onEvaluate(synthesized);
  };

  const isAAIngested = profile.data_source_mode === "AA_INGESTED" && Boolean(profile.consent_artifact_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6"
    >
      {/* Top Bar with Navigation & Mode Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-vapor-border">
        <button
          onClick={onNavigateToOverview}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-steel-muted hover:text-steel-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>&larr; BACK TO PRODUCT STORY &amp; BENCHMARKS</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
          {/* Sourcing Mode Badge as required */}
          {isAAIngested ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-300 font-bold uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>AA CONSENT VERIFIED // ARTIFACT: #{profile.consent_artifact_id}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>MODE: MANUAL SIMULATION</span>
            </div>
          )}

          {/* Primary Action Button to trigger AA Consent Modal */}
          <button
            type="button"
            onClick={() => setIsConsentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-primary hover:bg-steel-hover text-white font-mono text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>FETCH REAL AA TELEMETRY</span>
          </button>

          <div className="flex items-center gap-1.5 text-steel-muted pl-1 border-l border-vapor-border">
            <span>ENGINE:</span>
            <span
              className={`font-bold uppercase ${
                backendOnline ? "text-steel-primary" : "text-amber-600"
              }`}
            >
              {backendOnline ? "FASTAPI 8000 LIVE" : "CLIENT SIMULATION"}
            </span>
          </div>
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
                Run <code>uvicorn backend.main:app --port 8000</code> or continue in simulation mode.
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
            onSubmit={() => onEvaluate()}
            isLoading={isLoading}
            pulsingFields={pulsingFields}
            onOpenConsentModal={() => setIsConsentModalOpen(true)}
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
            <div className="bg-vapor-card border border-vapor-border p-10 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
              <div className="w-12 h-12 bg-vapor-subtle border border-vapor-border text-steel-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-steel-ink mb-1 font-mono uppercase">
                [ READY FOR UNDERWRITING EVALUATION ]
              </h3>
              <p className="text-xs text-steel-muted max-w-sm mb-5 leading-relaxed font-sans">
                Adjust the telemetry values in the left panel or click &ldquo;Fetch Real AA Telemetry&rdquo; to pull verified bank &amp; mobility vectors.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onEvaluate()}
                  className="px-5 py-2.5 bg-steel-primary hover:bg-steel-hover text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>EVALUATE CURRENT INPUTS</span>
                </button>
                <button
                  onClick={() => setIsConsentModalOpen(true)}
                  className="px-4 py-2.5 bg-white hover:bg-vapor-subtle text-steel-primary border border-steel-primary/30 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FETCH REAL AA TELEMETRY</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institutional RBI Account Aggregator Consent Modal */}
      <AAConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onSuccess={handleConsentSuccess}
        activePersonaId={selectedPresetId}
      />
    </motion.div>
  );
};
