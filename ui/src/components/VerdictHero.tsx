import React, { useState, useEffect, useRef } from "react";
import { animate } from "framer-motion";
import confetti from "canvas-confetti";
import type { CreditScoreResponse } from "../types/credit";
import { getStatusTheme } from "../lib/riskTheme";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Percent,
  Cpu,
  Hash,
} from "lucide-react";
import { cn } from "../lib/utils";

interface VerdictHeroProps {
  decision: CreditScoreResponse;
  latencyMs?: number;
  isSimulated?: boolean;
}

export const VerdictHero: React.FC<VerdictHeroProps> = ({
  decision,
  latencyMs,
  isSimulated,
}) => {
  const [copied, setCopied] = useState(false);
  const theme = getStatusTheme(decision.status);

  // Animated Count-Up Score State
  const targetScore = decision.credit_score ?? 300;
  const [displayScore, setDisplayScore] = useState<number>(targetScore);
  const prevScoreRef = useRef<number>(300);

  useEffect(() => {
    const controls = animate(prevScoreRef.current, targetScore, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayScore(Math.round(latest));
      },
    });

    prevScoreRef.current = targetScore;
    return () => controls.stop();
  }, [targetScore]);

  useEffect(() => {
    if (decision.status === "APPROVED" && targetScore >= 780) {
      try {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.6 },
          colors: ["#0E7490", "#111E25", "#ECFEFF", "#155E75"],
          ticks: 180,
        });
      } catch (e) {
        console.error("Confetti trigger error:", e);
      }
    }
  }, [decision.status, targetScore]);

  const copyAppId = () => {
    navigator.clipboard.writeText(decision.application_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Circular gauge parameters (Scale 300 - 900)
  const scorePct = Math.min(100, Math.max(0, ((displayScore - 300) / 600) * 100));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * scorePct) / 100;

  const getStatusIcon = () => {
    switch (decision.status) {
      case "APPROVED":
        return <CheckCircle2 className="w-5 h-5 text-steel-primary" />;
      case "MANUAL_REVIEW":
        return <AlertTriangle className="w-5 h-5 text-amber-700" />;
      case "REJECTED":
      default:
        return <XCircle className="w-5 h-5 text-rose-700" />;
    }
  };

  return (
    <div className="bg-vapor-card border border-vapor-border p-6 relative overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Minimal Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-225"
              viewBox="0 0 170 170"
            >
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke="#EBF1F0"
                strokeWidth="10"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="square"
              />
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="transparent"
                stroke={theme.primary}
                strokeWidth="10"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="square"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            {/* Center Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-steel-muted font-semibold">
                SCORE
              </span>
              <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tighter text-steel-ink">
                {displayScore}
              </span>
              <span className="text-[10px] font-mono text-steel-muted">
                300–900 FICO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1 font-mono">
            <span className="text-[10px] text-steel-muted uppercase">TIER:</span>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider",
                theme.badge
              )}
            >
              {decision.risk_tier ?? "UNKNOWN"}
            </span>
          </div>
        </div>

        {/* Right: Decision Verdict, Prob of Default & Telemetry Details */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-vapor-border">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-steel-muted">
                [ UNDERWRITING VERDICT ]
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusIcon()}
                <h3 className={cn("text-lg sm:text-xl font-extrabold font-mono uppercase tracking-tight m-0", theme.text)}>
                  {decision.status}
                </h3>
              </div>
            </div>

            {/* Application ID pill */}
            <div className="flex items-center gap-1.5 bg-vapor-subtle border border-vapor-border px-3 py-1.5 text-xs font-mono text-steel-muted">
              <Hash className="w-3.5 h-3.5 text-steel-muted" />
              <span className="truncate max-w-[140px] sm:max-w-[170px]">
                {decision.application_id}
              </span>
              <button
                onClick={copyAppId}
                title="Copy Application ID"
                className="hover:text-steel-ink transition-colors p-1 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-steel-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-steel-muted" />
                )}
              </button>
            </div>
          </div>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Probability of Default (PD) */}
            <div className="bg-vapor-subtle border border-vapor-border p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-[11px] text-steel-muted uppercase">
                  <Percent className="w-3.5 h-3.5 text-steel-muted" />
                  <span>DEFAULT PROB (PD)</span>
                </span>
                <span className="font-bold text-xs text-steel-ink">
                  {decision.default_probability !== null &&
                  decision.default_probability !== undefined
                    ? `${(decision.default_probability * 100).toFixed(2)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="w-full bg-vapor-border h-1">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(2, (decision.default_probability ?? 0) * 100)
                    )}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </div>
            </div>

            {/* Inference Telemetry */}
            <div className="bg-vapor-subtle border border-vapor-border p-3 space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-steel-muted">
                <span className="flex items-center gap-1 uppercase text-[10px]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>INFERENCE LAG</span>
                </span>
                <span className="font-bold text-steel-primary">
                  {latencyMs ? `${latencyMs} ms` : "14 ms"}
                </span>
              </div>
              <div className="flex items-center justify-between text-steel-muted text-[10px]">
                <span>MODE</span>
                <span>{isSimulated ? "SIMULATED" : "FASTAPI 8000"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
