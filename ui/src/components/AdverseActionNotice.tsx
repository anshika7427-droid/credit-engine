import React, { useState } from "react";
import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";
import {
  ShieldCheck,
  AlertOctagon,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import { formatINR } from "../lib/utils";

interface AdverseActionNoticeProps {
  profile: BorrowerProfile;
  decision: CreditScoreResponse;
}

export const AdverseActionNotice: React.FC<AdverseActionNoticeProps> = ({
  profile,
  decision,
}) => {
  const [copied, setCopied] = useState(false);
  const isAdverse = decision.status === "REJECTED" || decision.status === "MANUAL_REVIEW";

  const adverseItems =
    decision.adverse_action_reasons && decision.adverse_action_reasons.length > 0
      ? decision.adverse_action_reasons
      : [
          "Risk factor: upi_debit_to_credit_ratio",
          "Risk factor: cashflow_volatility",
          "Risk factor: utility_payment_delay_days",
        ];

  const getReasonNarrative = (reason: string) => {
    if (reason.includes("utility_payment_delay_days")) {
      return `Utility billing delay reached ${profile.utility_payment_delay_days} days, exceeding our maximum acceptable underwriting lag limit.`;
    }
    if (reason.includes("cashflow_volatility")) {
      return `Cashflow volatility index of ${profile.cashflow_volatility.toFixed(
        2
      )} denotes inconsistent period-over-period net inflow stabilization.`;
    }
    if (reason.includes("upi_debit_to_credit_ratio")) {
      return `Debit-to-credit ratio of ${profile.upi_debit_to_credit_ratio.toFixed(
        2
      )} indicates insufficient liquid cash cushion following routine withdrawals.`;
    }
    if (reason.includes("upi_tx_count_monthly")) {
      return `Monthly UPI transaction count (${profile.upi_tx_count_monthly} tx) fell below minimum alternative digital footprint floor.`;
    }
    if (reason.includes("ecommerce_cancellation_rate")) {
      return `Order cancellation rate of ${(profile.ecommerce_cancellation_rate * 100).toFixed(
        1
      )}% exceeded platform behavioral thresholds.`;
    }
    return `Model identified risk drag originating from ${reason.replace("Risk factor: ", "")}.`;
  };

  const handleCopyNotice = () => {
    const noticeText = `
ADVERSE ACTION NOTICE & REGULATORY DISCLOSURE
Engine: AURA Alternative Credit Decisioning System
Application ID: ${decision.application_id}
Date: ${new Date().toLocaleDateString("en-IN")}
Status: ${decision.status}
Credit Score: ${decision.credit_score}/900 | Risk Tier: ${decision.risk_tier}

PRINCIPAL REASONS FOR ADVERSE ACTION:
${decision.knockout_reason ? `• Knockout Trigger: ${decision.knockout_reason}\n` : ""}${adverseItems
      .map((r, i) => `${i + 1}. ${getReasonNarrative(r)}`)
      .join("\n")}

REGULATORY COMPLIANCE:
Issued in compliance with the Fair Credit Reporting Act (FCRA) and RBI Digital Lending Guidelines.
    `.trim();

    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E4E4E7] p-5 sm:p-7 shadow-sm space-y-5 font-sans relative">
        <div className="border-b border-[#E4E4E7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0029FF]">
                [ REGULATORY DISCLOSURE LETTER ]
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-[#F4F4F6] text-[#52525B] border border-[#E4E4E7]">
                FCRA § 615 &bull; RBI DLG-2022
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A0A0C] m-0 mt-1">
              Statement of Credit Determination or Adverse Action
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyNotice}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase bg-[#F4F4F6] hover:bg-[#0029FF] hover:text-white border border-[#E4E4E7] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0029FF]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY NOTICE</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              title="Print regulatory disclosure"
              className="p-1.5 bg-[#F4F4F6] hover:bg-slate-200 border border-[#E4E4E7] transition-colors cursor-pointer hidden sm:block"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F4F4F6] border border-[#E4E4E7] p-3 font-mono">
          <div>
            <span className="text-[10px] text-[#71717A] uppercase block">
              Application ID
            </span>
            <span className="text-[#0A0A0C] font-semibold truncate block">
              {decision.application_id}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] uppercase block">
              Decision Date
            </span>
            <span className="text-[#0A0A0C]">
              {new Date().toLocaleDateString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] uppercase block">
              Credit Score
            </span>
            <span className="text-[#0029FF] font-bold">
              {decision.credit_score} / 900
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] uppercase block">
              Status Verdict
            </span>
            <span
              className={
                decision.status === "APPROVED"
                  ? "text-[#0029FF] font-bold"
                  : decision.status === "MANUAL_REVIEW"
                  ? "text-amber-800 font-bold"
                  : "text-rose-700 font-bold"
              }
            >
              {decision.status}
            </span>
          </div>
        </div>

        {/* Knockout Policy Breach */}
        {decision.knockout_reason && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs space-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold uppercase text-[10px]">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>PRIMARY GROUND: HARD KNOCKOUT FLOOR BREACHED</span>
            </div>
            <p className="text-rose-950 font-bold m-0 font-sans">
              {decision.knockout_reason}
            </p>
          </div>
        )}

        {/* Principal Reasons */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold text-[#0A0A0C] uppercase tracking-wider m-0">
            {isAdverse
              ? "[ INFLUENCING RISK FACTORS // TREESHAP ATTRIBUTION ]"
              : "[ SATISFIED UNDERWRITING CRITERIA ]"}
          </h4>

          {isAdverse ? (
            <div className="space-y-2">
              {adverseItems.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-50/50 border border-rose-200 text-xs flex items-start gap-2.5 font-mono"
                >
                  <span className="font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 border border-rose-200 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold text-rose-950 block text-[11px]">
                      {reason}
                    </span>
                    <p className="text-rose-800 text-[11px] m-0 leading-relaxed font-sans">
                      {getReasonNarrative(reason)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-blue-50/50 border border-[#0029FF]/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#0029FF] font-mono font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>APPROVAL CRITERIA SATISFIED &mdash; NO ADVERSE NOTICE REQUIRED</span>
              </div>
              <p className="text-[11px] text-[#52525B] m-0 leading-relaxed">
                The applicant satisfies all risk tier thresholds with disciplined telecom consistency (
                {Math.round(profile.telecom_recharge_regularity * 100)}%), sustained digital inflow ({formatINR(profile.monthly_inflow)}), and zero policy floor violations.
              </p>
            </div>
          )}
        </div>

        {/* Consumer Statutory Rights */}
        <div className="pt-4 border-t border-[#E4E4E7] text-[11px] text-[#71717A] leading-relaxed font-mono">
          <p>
            Under Section 615 of the Fair Credit Reporting Act and the RBI Guidelines on Digital Lending (2022), you have the right to inspect the alternative data report utilized in this automated determination.
          </p>
        </div>
      </div>
    </div>
  );
};
