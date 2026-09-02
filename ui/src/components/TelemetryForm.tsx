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
} from "lucide-react";

interface TelemetryFormProps {
  profile: BorrowerProfile;
  onChange: (profile: BorrowerProfile) => void;
  onSubmit: () => void;
  isLoading: boolean;
  pulsingFields?: Set<keyof BorrowerProfile>;
}

export const TelemetryForm: React.FC<TelemetryFormProps> = ({
  profile,
  onChange,
  onSubmit,
  isLoading,
  pulsingFields = new Set(),
}) => {
  const [openSections, setOpenSections] = useState({
    persona: true,
    cashflow: true,
    discipline: true,
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
      warnings.push("Severe liquidity deficit: Debit/Credit > 1.05 combined with high volatility (>0.80) triggers hard reject.");
    }
    return warnings;
  }, [profile]);

  const getFieldPulseClass = (field: keyof BorrowerProfile) => {
    return pulsingFields.has(field)
      ? "ring-1 ring-[#0029FF] bg-blue-50/50 transition-all duration-500"
      : "transition-colors duration-200";
  };

  return (
    <div className="bg-white border border-[#E4E4E7] flex flex-col shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="p-4 border-b border-[#E4E4E7] bg-[#F4F4F6] flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#52525B] block">
            [ INGESTION WORKBENCH ]
          </span>
          <h2 className="text-sm font-bold text-[#0A0A0C] tracking-tight m-0">
            Application Telemetry Vectors
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-white text-[#0029FF] border border-[#E4E4E7] font-bold">
          9 VECTORS
        </span>
      </div>

      {/* Accordion List Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-none">
        {/* Accordion 1: Persona & Core Inflows */}
        <div className="border border-[#E4E4E7] bg-white">
          <button
            type="button"
            onClick={() => toggleSection("persona")}
            className="w-full px-4 py-3 bg-[#F4F4F6] hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-[#0A0A0C]">
              <Wallet className="w-3.5 h-3.5 text-[#0029FF]" />
              <span>01 // Inflow &amp; Classification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#0029FF] font-bold">
                {formatINR(profile.monthly_inflow)}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
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
                <div className="p-4 space-y-4 border-t border-[#E4E4E7]">
                  {/* Borrower Segment Toggle Buttons */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#52525B] mb-2 font-semibold">
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
                                ? "bg-[#0029FF] border-[#0029FF] text-white"
                                : "bg-white border-[#E4E4E7] text-[#0A0A0C] hover:bg-[#F4F4F6]"
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

                  {/* Monthly Inflow Currency Input & Slider with #0029FF track */}
                  <div className={getFieldPulseClass("monthly_inflow")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-[#52525B] uppercase text-[11px]">
                        Monthly Verified Inflow
                      </label>
                      <span className="font-bold text-[#0029FF]">
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
                        className="w-28 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: UPI & Cashflow Dynamics */}
        <div className="border border-[#E4E4E7] bg-white">
          <button
            type="button"
            onClick={() => toggleSection("cashflow")}
            className="w-full px-4 py-3 bg-[#F4F4F6] hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-[#0A0A0C]">
              <ArrowDownUp className="w-3.5 h-3.5 text-[#0029FF]" />
              <span>02 // Cashflow Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#52525B]">
                {profile.upi_tx_count_monthly} tx &bull; D/C {profile.upi_debit_to_credit_ratio.toFixed(2)}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
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
                <div className="p-4 space-y-4 border-t border-[#E4E4E7]">
                  {/* Monthly UPI Transactions */}
                  <div className={getFieldPulseClass("upi_tx_count_monthly")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-[#52525B] uppercase text-[11px]">
                        Monthly UPI Velocity
                      </label>
                      <span className="font-bold text-[#0A0A0C]">
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
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
                    </div>
                  </div>

                  {/* Debit to Credit Ratio */}
                  <div className={getFieldPulseClass("upi_debit_to_credit_ratio")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-[#52525B] uppercase text-[11px]">
                        Debit / Credit Ratio
                      </label>
                      <span className="font-bold text-[#0A0A0C]">
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
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
                    </div>
                  </div>

                  {/* Cashflow Volatility */}
                  <div className={getFieldPulseClass("cashflow_volatility")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-[#52525B] uppercase text-[11px]">
                        Volatility Index (σ / μ)
                      </label>
                      <span className="font-bold text-[#0A0A0C]">
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
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Discipline & Regularity */}
        <div className="border border-[#E4E4E7] bg-white">
          <button
            type="button"
            onClick={() => toggleSection("discipline")}
            className="w-full px-4 py-3 bg-[#F4F4F6] hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-[#0A0A0C]">
              <Calendar className="w-3.5 h-3.5 text-[#0029FF]" />
              <span>03 // Discipline &amp; Delinquency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#52525B]">
                {profile.utility_payment_delay_days}d lag
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
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
                <div className="p-4 space-y-4 border-t border-[#E4E4E7]">
                  {/* Utility Payment Delay */}
                  <div className={getFieldPulseClass("utility_payment_delay_days")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[#52525B] uppercase text-[11px]">
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
                          "font-bold",
                          profile.utility_payment_delay_days > 25
                            ? "text-rose-600"
                            : "text-[#0A0A0C]"
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
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
                    </div>
                  </div>

                  {/* Telecom Recharge Consistency */}
                  <div className={getFieldPulseClass("telecom_recharge_regularity")}>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                      <label className="text-[#52525B] uppercase text-[11px]">
                        Telecom Habit
                      </label>
                      <span className="font-bold text-[#0029FF]">
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
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#E4E4E7] text-xs font-mono text-[#0A0A0C] focus:outline-none focus:border-[#0029FF]"
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
                        className="flex-1 h-1 bg-[#E4E4E7] rounded-none appearance-none cursor-pointer accent-[#0029FF]"
                      />
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
      <div className="p-4 border-t border-[#E4E4E7] bg-white">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#0029FF] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>COMPUTING TREESHAP ATTR...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>EVALUATE APPLICATION</span>
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
