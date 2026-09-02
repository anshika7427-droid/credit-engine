import React from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ExplainabilityPanelProps {
  positiveFactors: string[];
  adverseFactors: string[];
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  telecom_recharge_regularity: "High consistency in prepaid mobile recharges indicates stable liquidity habit.",
  upi_tx_count_monthly: "High velocity of digital transactions signals active commercial livelihood.",
  monthly_inflow: "Robust monthly cash inflow covers credit debt service obligations.",
  upi_debit_to_credit_ratio: "Controlled debit-to-credit balance shows positive net cash retention.",
  cashflow_volatility: "Unpredictable variance between earnings cycles flags volatility risk.",
  utility_payment_delay_days: "Past billing delinquency correlates with propensity to default.",
  ecommerce_cancellation_rate: "Elevated transaction abandonment or returns flags impulsive behavior.",
  gst_filing_punctuality: "Disciplined statutory tax filing confirms legitimate business turnover.",
};

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  positiveFactors,
  adverseFactors,
}) => {
  const getFeatureGlossary = (text: string) => {
    for (const [key, desc] of Object.entries(FEATURE_DESCRIPTIONS)) {
      if (text.includes(key)) {
        return desc;
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Positive Drivers (Credit Strengths) */}
      <div className="bg-[#18181b] border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-300 m-0">
                Credit Strengths (SHAP +)
              </h4>
              <p className="text-[11px] text-zinc-400 m-0">
                Top drivers pushing score towards approval
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {positiveFactors.length} Signals
          </span>
        </div>

        <div className="space-y-2.5">
          {positiveFactors.length > 0 ? (
            positiveFactors.map((factor, idx) => {
              const glossary = getFeatureGlossary(factor);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-200"
                >
                  <div className="flex items-center gap-2 font-mono font-medium text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                  {glossary && (
                    <p className="text-[11px] text-zinc-400 mt-1 pl-5 leading-relaxed">
                      {glossary}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-500">
              No strong positive alternative data signals identified.
            </div>
          )}
        </div>
      </div>

      {/* Adverse Factors (Risk Drivers) */}
      <div className="bg-[#18181b] border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-300 m-0">
                Adverse Action Reasons (SHAP -)
              </h4>
              <p className="text-[11px] text-zinc-400 m-0">
                Regulatory disclosure risk factors (FCRA)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {adverseFactors.length} Flags
          </span>
        </div>

        <div className="space-y-2.5">
          {adverseFactors.length > 0 ? (
            adverseFactors.map((factor, idx) => {
              const glossary = getFeatureGlossary(factor);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-zinc-200"
                >
                  <div className="flex items-center gap-2 font-mono font-medium text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                  {glossary && (
                    <p className="text-[11px] text-zinc-400 mt-1 pl-5 leading-relaxed">
                      {glossary}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-500">
              No adverse risk factors flagged for this application.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
