import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  BorrowerProfile,
  CreditScoreResponse,
  EvaluationRecord,
  PersonaPreset,
} from "./types/credit";
import { PERSONA_PRESETS } from "./constants/presets";
import {
  checkBackendHealth,
  submitCreditEvaluation,
  simulateCreditScoring,
} from "./services/api";
import { Preloader } from "./components/Preloader";
import { VeyraNav, type ActiveView } from "./components/VeyraNav";
import { LandingPage } from "./views/LandingPage";
import { UnderwritingConsole } from "./views/UnderwritingConsole";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

export const App: React.FC = () => {
  // Lenis Smooth Momentum Inertia Scroll
  useSmoothScroll();

  // Preloader State (runs once on initial mount)
  const [showPreloader, setShowPreloader] = useState<boolean>(true);

  // Dynamic Navigation Theme
  const [navTheme, setNavTheme] = useState<"light" | "dark">("light");

  // Primary Routing / View State
  const [currentView, setCurrentView] = useState<ActiveView>("landing");
  const [, setSelectedPersona] = useState<BorrowerProfile | null>(null);

  // Telemetry and Model State
  const [profile, setProfile] = useState<BorrowerProfile>(
    PERSONA_PRESETS[0].profile
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    PERSONA_PRESETS[0].id
  );
  const [decision, setDecision] = useState<CreditScoreResponse | null>(() =>
    simulateCreditScoring(PERSONA_PRESETS[0].profile)
  );
  const [latencyMs, setLatencyMs] = useState<number | undefined>(14);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field Pulse Animation on Preset Auto-fill
  const [pulsingFields, setPulsingFields] = useState<Set<keyof BorrowerProfile>>(
    new Set()
  );
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Backend Health Telemetry
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [backendLatency, setBackendLatency] = useState<number>(0);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // History Drawer & Persistence
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<EvaluationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("aura_evaluation_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem("aura_evaluation_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to persist history:", e);
    }
  }, [history]);

  // Health check handler
  const performHealthCheck = useCallback(async () => {
    setCheckingHealth(true);
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
      setBackendLatency(health.latencyMs);
      if (health.online) {
        setIsSimulated(false);
      }
    } catch {
      setBackendOnline(false);
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  // Run health check on initial load and setup interval
  useEffect(() => {
    const timer = setTimeout(() => {
      performHealthCheck();
    }, 0);
    const interval = setInterval(performHealthCheck, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [performHealthCheck]);

  // Handle Preset Selection with visual pulse
  const handleSelectPreset = (preset: PersonaPreset) => {
    setSelectedPresetId(preset.id);
    setProfile(preset.profile);
    setSelectedPersona(preset.profile);
    setErrorMessage(null);

    const changedKeys = new Set<keyof BorrowerProfile>();
    (Object.keys(preset.profile) as Array<keyof BorrowerProfile>).forEach(
      (key) => {
        if (preset.profile[key] !== profile[key]) {
          changedKeys.add(key);
        }
      }
    );
    setPulsingFields(changedKeys);

    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => {
      setPulsingFields(new Set());
    }, 1200);

    const simulated = simulateCreditScoring(preset.profile);
    setDecision(simulated);
    setLatencyMs(14);
  };

  // Profile parameter change
  const handleProfileChange = (updated: BorrowerProfile) => {
    setProfile(updated);
    setSelectedPersona(updated);
    setSelectedPresetId(null);
  };

  // Submit evaluation
  const handleEvaluate = async (overrideProfile?: BorrowerProfile) => {
    setIsLoading(true);
    setErrorMessage(null);
    const targetProfile = overrideProfile || profile;

    try {
      if (isSimulated) {
        await new Promise((r) => setTimeout(r, 220));
        const simResult = simulateCreditScoring(targetProfile);
        setDecision(simResult);
        setLatencyMs(14);

        const newRecord: EvaluationRecord = {
          id: simResult.application_id,
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          profile: { ...targetProfile },
          result: simResult,
          latencyMs: 14,
        };
        setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
        return;
      }

      const res = await submitCreditEvaluation(targetProfile);
      setDecision(res.data);
      setLatencyMs(res.latencyMs);

      const newRecord: EvaluationRecord = {
        id: res.data.application_id,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        profile: { ...targetProfile },
        result: res.data,
        latencyMs: res.latencyMs,
      };
      setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Underwriting evaluation failed";
      setErrorMessage(msg);

      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Connection refused") ||
        msg.includes("Cannot connect")
      ) {
        setBackendOnline(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Global keyboard shortcut: Ctrl+Enter or Cmd+Enter to evaluate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (currentView !== "console") {
          setCurrentView("console");
        }
        handleEvaluate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Launch console directly from landing page CTA, preset click, or micro-simulator
  const handleLaunchConsole = (
    preset?: PersonaPreset,
    customProfile?: BorrowerProfile
  ) => {
    if (preset) {
      handleSelectPreset(preset);
    } else if (customProfile) {
      setProfile(customProfile);
      setSelectedPersona(customProfile);
      setSelectedPresetId(null);
      const simulated = simulateCreditScoring(customProfile);
      setDecision(simulated);
      setLatencyMs(14);
    }
    setCurrentView("console");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Restore historical record into active console
  const handleSelectRecord = (record: EvaluationRecord) => {
    setProfile(record.profile);
    setSelectedPersona(record.profile);
    setDecision(record.result);
    setLatencyMs(record.latencyMs);
    setSelectedPresetId(null);
    setCurrentView("console");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#111E25] flex flex-col font-sans selection:bg-[#ECFEFF] selection:text-[#0E7490]">
      {/* Veyra Initial Screen Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Transparent Frosted Sticky Navbar */}
      <VeyraNav
        activeView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        backendOnline={backendOnline}
        backendLatency={backendLatency}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onCheckHealth={performHealthCheck}
        checkingHealth={checkingHealth}
        navTheme={currentView === "console" ? "light" : navTheme}
      />

      {/* Primary Workspace View Switcher with Scale & Opacity Page Cross-Fade */}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {currentView === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingPage
                onLaunchConsole={handleLaunchConsole}
                backendOnline={backendOnline}
                backendLatency={backendLatency}
                onThemeChange={setNavTheme}
              />
            </motion.div>
          ) : (
            <motion.div
              key="console"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-16 md:pt-20"
            >
              <UnderwritingConsole
                profile={profile}
                onChangeProfile={handleProfileChange}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                decision={decision}
                latencyMs={latencyMs}
                isSimulated={isSimulated}
                isLoading={isLoading}
                onEvaluate={handleEvaluate}
                backendOnline={backendOnline}
                onSwitchToSimulation={() => {
                  setIsSimulated(true);
                  setErrorMessage(null);
                }}
                errorMessage={errorMessage}
                pulsingFields={pulsingFields}
                onNavigateToOverview={() => setCurrentView("landing")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Minimalist Footer */}
      <footer className="border-t border-[#DDE5E5] bg-white py-4 px-4 lg:px-8 text-center text-xs text-[#4F616B] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AURA &bull; AUTONOMOUS ALTERNATIVE CREDIT OS</span>
          <span>FASTAPI ENDPOINT: <code>POST http://127.0.0.1:8000/api/v1/score</code></span>
        </div>
      </footer>

      {/* Audit History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={handleSelectRecord}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
};

export default App;
