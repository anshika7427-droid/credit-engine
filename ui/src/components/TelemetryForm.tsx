import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BorrowerProfile } from "../types/credit";
import { formatINR, cn } from "../lib/utils";
import {
  Wallet,
  ArrowDownUp,
  AlertTriangle,
  Zap,
  Calendar,
  ChevronDown,
  Bike,
  Store,
  Laptop,
  Truck,
  Lock,
  Sparkles,
} from "lucide-react";

interface TelemetryFormProps {
  profile: BorrowerProfile;
  onChange: (profile: BorrowerProfile) => void;
  onSubmit: () => void;
  isLoading: boolean;
  pulsingFields?: Set<keyof BorrowerProfile>;
  onOpenConsentModal?: () => void;
}

export const TelemetryForm: React.FC<TelemetryFormProps> = ({
  profile,
  onChange,
  onSubmit,
  isLoading,
  pulsingFields = new Set(),
  onOpenConsentModal,
}) => {
  const [openSections, setOpenSections] = useState({
    persona: true,
    cashflow: true,
    discipline: true,
    mobility: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = <K extends keyof BorrowerProfile>(
    key: K,
    value: BorrowerProfile[K]
  ) => {
    onChange({
      ...profile,
      [key]: value,
      // If user manually modifies a slider, flag as manual simulation unless explicit
      data_source_mode: key === "consent_artifact_id" ? profile.data_source_mode : "MANUAL_SIMULATION",
    });
  };

  const preflightKnockouts = useMemo(() => {
    const warnings: string[] = [];
    if (profile.upi_tx_count_monthly < 5) {
      warnings.push("Thin-file floor: < 5 monthly UPI transactions triggers hard reject.");
    }
    if (profile.utility_payment_delay_days > 25) {
      warnings.push("Chronic delinquency: Utility delay > 25 days triggers automatic knockout.");
    }
    if (profile.upi_debit_to_credit_ratio > 1.05 && profile.cashflow_volatility > 0.8) {
      warnings.push(
        "Severe liquidity deficit: Debit/Credit > 1.05 combined with high volatility (>0.80) triggers hard reject."
      );
    }
    return warnings;
  }, [profile]);

  const getFieldPulseClass = (field: keyof BorrowerProfile) => {
    return pulsingFields.has(field)
      ? "ring-1 ring-steel-primary bg-steel-tint transition-all duration-500"
      : "transition-colors duration-200";
  };

  const mobilityScore = profile.mobility_activity_score ?? 50.0;

  return (
    <div className="bg-vapor-card border border-vapor-border flex flex-col shadow-sm overflow-hidden font-sans">
      {/* Form Header */}
      <div className="p-4 border-b border-vapor-border bg-vapor-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-steel-muted block">
            [ STAGE 1: INGESTION WORKBENCH ]
          </span>
          <h2 className="text-sm font-bold text-steel-ink tracking-tight m-0">
            Application Telemetry Vectors
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenConsentModal && (
            <button
              type="button"
              onClick={onOpenConsentModal}
              className="px-2.5 py-1 bg-steel-primary/10 hover:bg-steel-primary text-steel-primary hover:text-white border border-steel-primary/30 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>FETCH REAL AA</span>
            </button>
          )}
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-vapor-card text-steel-primary border border-vapor-border font-bold">
            10 VECTORS
          </span>
        </div>
      </div>

      {/* Sourcing Mode Subheader */}
      {profile.consent_artifact_id && profile.data_source_mode === "AA_INGESTED" && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-[11px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span className="font-bold uppercase">AA VERIFIED: #{profile.consent_artifact_id}</span>
          </div>
          <span className="text-[10px] opacity-75">180-DAY RAW TELEMETRY PULL</span>
        </div>
      )}

      {/* Accordion List Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-none">
        {/* Accordion 1: Persona & Core Inflows */}
        <div className="border border-vapor-border bg-vapor-card">
          <button
            type="button"
            onClick={() => toggleSection("persona")}
            className="w-full px-4 py-3 bg-vapor-subtle hover:bg-vapor-canvas flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-steel-ink">
              <Wallet className="w-3.5 h-3.5 text-steel-primary" />
              <span>01 // Inflow &amp; Classification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-steel-primary font-bold">
                {formatINR(profile.monthly_inflow)}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-steel-muted transition-transform duration-200",
                  openSections.persona && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {openSections.persona && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 border-t border-vapor-border">
                  {/* Borrower Segment Toggle Buttons */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-steel-muted mb-2 font-semibold">
                      Classification
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "gig_worker", label: "Gig Partner", icon: Bike },
                          { id: "kirana_merchant", label: "Kirana", icon: Store },
                          { id: "freelancer", label: "Contractor", icon: Laptop },
                        ] as const
                      ).map((item) => {
                        const Icon = item.icon;
                        const isSelected = profile.borrower_type === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateField("borrower_type", item.id)}
                            className={cn(
                              "p-2.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                              getFieldPulseClass("borrower_type"),
                              isSelected
                                ? "bg-steel-primary border-steel-primary text-white"
                                : "bg-vapor-card border-vapor-border text-steel-ink hover:bg-vapor-subtle"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono uppercase font-bold leading-tight">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Inflow Currency Input & Slider with Steel Teal track */}
                  <div className={getFieldPulseClass("monthly_inflow")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        Monthly Verified Inflow
                      </label>
                      <span className="font-bold text-steel-primary bg-steel-tint px-2 py-0.5 rounded">
                        {formatINR(profile.monthly_inflow)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5000}
                        max={500000}
                        step={1000}
                        value={profile.monthly_inflow}
                        onChange={(e) =>
                          updateField("monthly_inflow", Number(e.target.value) || 0)
                        }
                        className="w-28 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={5000}
                        max={200000}
                        step={2500}
                        value={profile.monthly_inflow}
                        onChange={(e) =>
                          updateField("monthly_inflow", Number(e.target.value))
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: UPI & Cashflow Dynamics */}
        <div className="border border-vapor-border bg-vapor-card">
          <button
            type="button"
            onClick={() => toggleSection("cashflow")}
            className="w-full px-4 py-3 bg-vapor-subtle hover:bg-vapor-canvas flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-steel-ink">
              <ArrowDownUp className="w-3.5 h-3.5 text-steel-primary" />
              <span>02 // Cashflow Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-steel-muted">
                {profile.upi_tx_count_monthly} tx &bull; D/C {profile.upi_debit_to_credit_ratio.toFixed(2)}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-steel-muted transition-transform duration-200",
                  openSections.cashflow && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {openSections.cashflow && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 border-t border-vapor-border">
                  {/* Monthly UPI Transactions */}
                  <div className={getFieldPulseClass("upi_tx_count_monthly")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        Monthly UPI Velocity
                      </label>
                      <span className="font-bold text-steel-primary bg-steel-tint px-2 py-0.5 rounded">
                        {profile.upi_tx_count_monthly} tx / mo
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={profile.upi_tx_count_monthly}
                        onChange={(e) =>
                          updateField(
                            "upi_tx_count_monthly",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0}
                        max={150}
                        value={profile.upi_tx_count_monthly}
                        onChange={(e) =>
                          updateField(
                            "upi_tx_count_monthly",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* Debit to Credit Ratio */}
                  <div className={getFieldPulseClass("upi_debit_to_credit_ratio")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        Debit / Credit Ratio
                      </label>
                      <span className="font-bold text-steel-ink bg-vapor-subtle px-2 py-0.5 rounded">
                        {profile.upi_debit_to_credit_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.01}
                        min={0.1}
                        max={2.0}
                        value={profile.upi_debit_to_credit_ratio}
                        onChange={(e) =>
                          updateField(
                            "upi_debit_to_credit_ratio",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0.2}
                        max={1.5}
                        step={0.01}
                        value={profile.upi_debit_to_credit_ratio}
                        onChange={(e) =>
                          updateField(
                            "upi_debit_to_credit_ratio",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* Cashflow Volatility */}
                  <div className={getFieldPulseClass("cashflow_volatility")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        Volatility Index (σ / μ)
                      </label>
                      <span className="font-bold text-steel-ink bg-vapor-subtle px-2 py-0.5 rounded">
                        {profile.cashflow_volatility.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.01}
                        min={0.0}
                        max={1.0}
                        value={profile.cashflow_volatility}
                        onChange={(e) =>
                          updateField(
                            "cashflow_volatility",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0.05}
                        max={1.0}
                        step={0.01}
                        value={profile.cashflow_volatility}
                        onChange={(e) =>
                          updateField(
                            "cashflow_volatility",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Discipline & Regularity */}
        <div className="border border-vapor-border bg-vapor-card">
          <button
            type="button"
            onClick={() => toggleSection("discipline")}
            className="w-full px-4 py-3 bg-vapor-subtle hover:bg-vapor-canvas flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-steel-ink">
              <Calendar className="w-3.5 h-3.5 text-steel-primary" />
              <span>03 // Discipline &amp; Delinquency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-steel-muted">
                {profile.utility_payment_delay_days}d lag &bull; GST {Math.round(profile.gst_filing_punctuality * 100)}%
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-steel-muted transition-transform duration-200",
                  openSections.discipline && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {openSections.discipline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 border-t border-vapor-border">
                  {/* Utility Payment Delay */}
                  <div className={getFieldPulseClass("utility_payment_delay_days")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <label className="text-steel-muted uppercase text-[11px]">
                          Utility Delay Lag
                        </label>
                        {profile.utility_payment_delay_days > 25 && (
                          <span className="text-[9px] text-rose-600 font-bold">
                            [KO &gt; 25D]
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-bold px-2 py-0.5 rounded",
                          profile.utility_payment_delay_days > 25
                            ? "text-rose-600 bg-rose-50"
                            : "text-steel-ink bg-vapor-subtle"
                        )}
                      >
                        {profile.utility_payment_delay_days} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={profile.utility_payment_delay_days}
                        onChange={(e) =>
                          updateField(
                            "utility_payment_delay_days",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0}
                        max={45}
                        value={profile.utility_payment_delay_days}
                        onChange={(e) =>
                          updateField(
                            "utility_payment_delay_days",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* Telecom Recharge Consistency */}
                  <div className={getFieldPulseClass("telecom_recharge_regularity")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        Telecom Habit Regularity
                      </label>
                      <span className="font-bold text-steel-primary bg-steel-tint px-2 py-0.5 rounded">
                        {Math.round(profile.telecom_recharge_regularity * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.05}
                        min={0.0}
                        max={1.0}
                        value={profile.telecom_recharge_regularity}
                        onChange={(e) =>
                          updateField(
                            "telecom_recharge_regularity",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0.2}
                        max={1.0}
                        step={0.01}
                        value={profile.telecom_recharge_regularity}
                        onChange={(e) =>
                          updateField(
                            "telecom_recharge_regularity",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* GST Filing Punctuality */}
                  <div className={getFieldPulseClass("gst_filing_punctuality")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        GST Filing Punctuality
                      </label>
                      <span className="font-bold text-steel-ink bg-vapor-subtle px-2 py-0.5 rounded">
                        {Math.round(profile.gst_filing_punctuality * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.05}
                        min={0.0}
                        max={1.0}
                        value={profile.gst_filing_punctuality}
                        onChange={(e) =>
                          updateField(
                            "gst_filing_punctuality",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0.0}
                        max={1.0}
                        step={0.02}
                        value={profile.gst_filing_punctuality}
                        onChange={(e) =>
                          updateField(
                            "gst_filing_punctuality",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* E-Commerce Order Cancellation Rate */}
                  <div className={getFieldPulseClass("ecommerce_cancellation_rate")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-steel-muted uppercase text-[11px]">
                        E-Com Cancellation Drag
                      </label>
                      <span className="font-bold text-steel-ink bg-vapor-subtle px-2 py-0.5 rounded">
                        {(profile.ecommerce_cancellation_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.01}
                        min={0.0}
                        max={0.5}
                        value={profile.ecommerce_cancellation_rate}
                        onChange={(e) =>
                          updateField(
                            "ecommerce_cancellation_rate",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0.01}
                        max={0.35}
                        step={0.01}
                        value={profile.ecommerce_cancellation_rate}
                        onChange={(e) =>
                          updateField(
                            "ecommerce_cancellation_rate",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 4: Mobility & Fleet Telemetry (Stage 1 Feature) */}
        <div className="border border-vapor-border bg-vapor-card">
          <button
            type="button"
            onClick={() => toggleSection("mobility")}
            className="w-full px-4 py-3 bg-vapor-subtle hover:bg-vapor-canvas flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-steel-ink">
              <Truck className="w-3.5 h-3.5 text-steel-primary" />
              <span>04 // Mobility &amp; Fleet Index</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-steel-primary font-bold">
                {mobilityScore.toFixed(1)} / 100
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-steel-muted transition-transform duration-200",
                  openSections.mobility && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {openSections.mobility && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4 border-t border-vapor-border">
                  <div className={getFieldPulseClass("mobility_activity_score")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <label className="text-steel-muted uppercase text-[11px]">
                          Mobility Activity Index
                        </label>
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded",
                            mobilityScore >= 70
                              ? "bg-steel-tint text-steel-primary"
                              : mobilityScore >= 40
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-700"
                          )}
                        >
                          {mobilityScore >= 70
                            ? "FLEET PRIME // 18% RISK REDUCTION"
                            : mobilityScore >= 40
                            ? "REGULAR LOGISTICS"
                            : "LIMITED RADIUS"}
                        </span>
                      </div>
                      <span className="font-bold text-steel-primary bg-steel-tint px-2 py-0.5 rounded">
                        {mobilityScore.toFixed(1)} / 100
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={mobilityScore}
                        onChange={(e) =>
                          updateField(
                            "mobility_activity_score",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2.5 py-1.5 bg-vapor-card border border-vapor-border text-xs font-mono text-steel-ink focus:outline-none focus:border-steel-primary"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={mobilityScore}
                        onChange={(e) =>
                          updateField(
                            "mobility_activity_score",
                            Number(e.target.value)
                          )
                        }
                        className="flex-1 h-1.5 bg-vapor-subtle rounded-none appearance-none cursor-pointer accent-steel-primary"
                      />
                    </div>
                  </div>

                  {/* Dynamic Telemetry Sub-indicators */}
                  <div className="p-3 bg-vapor-subtle border border-vapor-border rounded text-[11px] font-mono space-y-1.5 text-steel-muted">
                    <div className="text-[10px] uppercase font-bold text-steel-ink flex items-center justify-between">
                      <span>SYNTHESIZED STAGE 1 SIGNALS:</span>
                      <span className="text-steel-primary">telemetry_parser.py</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div>
                        <span className="opacity-75 block">FASTag Passes:</span>
                        <span className="font-bold text-steel-ink">
                          {mobilityScore >= 70 ? "14 Toll Passes / mo" : mobilityScore >= 40 ? "5 Toll Passes / mo" : "1 Toll Pass / mo"}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75 block">Commercial RC:</span>
                        <span className="font-bold text-steel-primary">
                          {mobilityScore >= 60 ? "Verified Commercial" : "Private / Local"}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75 block">Est. Daily Mileage:</span>
                        <span className="font-bold text-steel-ink">
                          ~{Math.round(15 + mobilityScore * 0.85)} KM / day
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75 block">Repayment Correlation:</span>
                        <span className="font-bold text-emerald-700">
                          {mobilityScore >= 65 ? "-18% Default Odds" : "Neutral"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pre-flight Knockout Warning */}
        {preflightKnockouts.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-xs font-mono text-rose-900 space-y-1">
            <div className="flex items-center gap-2 font-bold uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>[ HARD KNOCKOUT FLAG DETECTED ]</span>
            </div>
            {preflightKnockouts.map((w, idx) => (
              <p key={idx} className="text-[11px] text-rose-800 m-0">
                &bull; {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer Button */}
      <div className="p-4 border-t border-vapor-border bg-vapor-card">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-steel-primary hover:bg-steel-hover text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>STAGE 2: LIGHTGBM / TREESHAP...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>EVALUATE APPLICATION (STAGE 2)</span>
              <span className="ml-auto text-[10px] opacity-75 hidden sm:inline">
                CTRL + ENTER
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
