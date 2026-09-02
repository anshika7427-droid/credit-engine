import React, { useState } from "react";
import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";
import {
  Code2,
  FileText,
  BarChart3,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { cn, formatINR } from "../lib/utils";

interface AuditInspectorProps {
  profile: BorrowerProfile;
  decision: CreditScoreResponse;
}

export const AuditInspector: React.FC<AuditInspectorProps> = ({
  profile,
  decision,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "json" | "benchmarks">(
    "summary"
  );
  const [copied, setCopied] = useState(false);

  const fullAuditPayload = {
    timestamp: new Date().toISOString(),
    engine: "AURA Alternative Credit Decisioning Engine v1.0",
    input_profile: profile,
    scoring_verdict: decision,
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullAuditPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-lg">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-2 border-b border-[#27272a] bg-[#121215]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "summary"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Policy Summary</span>
          </button>

          <button
            onClick={() => setActiveTab("benchmarks")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "benchmarks"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Metric Benchmarks</span>
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              activeTab === "json"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw Audit Trail (JSON)</span>
          </button>
        </div>

        {activeTab === "json" && (
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="font-mono text-[11px]">Copy JSON</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#121215] border border-[#27272a] rounded-xl">
                <span className="text-[10px] uppercase font-mono text-zinc-500">
                  Application ID
                </span>
                <p className="text-xs font-mono text-zinc-200 truncate mt-0.5">
                  {decision.application_id}
                </p>
              </div>

              <div className="p-3 bg-[#121215] border border-[#27272a] rounded-xl">
                <span className="text-[10px] uppercase font-mono text-zinc-500">
                  Borrower Archetype
                </span>
                <p className="text-xs font-semibold text-zinc-200 capitalize mt-0.5">
                  {profile.borrower_type.replace("_", " ")}
                </p>
              </div>

              <div className="p-3 bg-[#121215] border border-[#27272a] rounded-xl">
                <span className="text-[10px] uppercase font-mono text-zinc-500">
                  Regulatory Compliance
                </span>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>FCRA & RBI Compliant</span>
                </p>
              </div>
            </div>

            {/* Policy Notes */}
            <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
              <h5 className="text-xs font-semibold text-zinc-300 m-0">
                Underwriter Notes & Policy Rules Checked
              </h5>
              <div className="text-xs text-zinc-400 space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span>Zero-tolerance liquidity rule (Debit/Credit &gt; 1.05 &amp; Vol &gt; 0.80):</span>
                  <span
                    className={
                      profile.upi_debit_to_credit_ratio > 1.05 && profile.cashflow_volatility > 0.8
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    {profile.upi_debit_to_credit_ratio > 1.05 && profile.cashflow_volatility > 0.8
                      ? "FAIL"
                      : "PASS"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Utility payment delay limit (Delay &gt; 25 days):</span>
                  <span
                    className={
                      profile.utility_payment_delay_days > 25
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    {profile.utility_payment_delay_days > 25 ? "FAIL" : "PASS"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Minimum monthly UPI transaction floor (&lt; 5 tx):</span>
                  <span
                    className={
                      profile.upi_tx_count_monthly < 5
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    {profile.upi_tx_count_monthly < 5 ? "FAIL" : "PASS"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "benchmarks" && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 mb-2">
              Comparison of current borrower alternative data metrics against benchmark prime criteria:
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Monthly Inflow",
                  value: formatINR(profile.monthly_inflow),
                  benchmark: ">= ₹40,000",
                  status: profile.monthly_inflow >= 40000 ? "prime" : "review",
                },
                {
                  label: "UPI Debit-to-Credit Ratio",
                  value: profile.upi_debit_to_credit_ratio.toFixed(2),
                  benchmark: "<= 0.80",
                  status:
                    profile.upi_debit_to_credit_ratio <= 0.80
                      ? "prime"
                      : profile.upi_debit_to_credit_ratio <= 1.05
                      ? "review"
                      : "risk",
                },
                {
                  label: "Cashflow Volatility (σ / μ)",
                  value: profile.cashflow_volatility.toFixed(2),
                  benchmark: "<= 0.30",
                  status:
                    profile.cashflow_volatility <= 0.30
                      ? "prime"
                      : profile.cashflow_volatility <= 0.60
                      ? "review"
                      : "risk",
                },
                {
                  label: "Utility Delay",
                  value: `${profile.utility_payment_delay_days} days`,
                  benchmark: "<= 5 days",
                  status:
                    profile.utility_payment_delay_days <= 5
                      ? "prime"
                      : profile.utility_payment_delay_days <= 25
                      ? "review"
                      : "risk",
                },
                {
                  label: "Telecom Recharge Regularity",
                  value: `${(profile.telecom_recharge_regularity * 100).toFixed(0)}%`,
                  benchmark: ">= 90%",
                  status:
                    profile.telecom_recharge_regularity >= 0.90
                      ? "prime"
                      : profile.telecom_recharge_regularity >= 0.70
                      ? "review"
                      : "risk",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs"
                >
                  <div className="font-medium text-zinc-300 w-1/3 truncate">
                    {item.label}
                  </div>
                  <div className="font-mono text-zinc-200 text-center w-1/3">
                    {item.value}{" "}
                    <span className="text-[10px] text-zinc-500 font-sans">
                      (target: {item.benchmark})
                    </span>
                  </div>
                  <div className="w-1/3 text-right">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold",
                        item.status === "prime"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : item.status === "review"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "json" && (
          <div className="relative">
            <pre className="p-4 rounded-xl bg-[#0d0d0f] border border-[#27272a] text-xs font-mono text-zinc-300 overflow-x-auto max-h-[280px] leading-relaxed">
              {JSON.stringify(fullAuditPayload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
