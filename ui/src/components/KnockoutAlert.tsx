import React, { useState } from "react";
import { ShieldAlert, ChevronRight, X, Info } from "lucide-react";

interface KnockoutAlertProps {
  knockoutReason: string | null;
}

export const KnockoutAlert: React.FC<KnockoutAlertProps> = ({ knockoutReason }) => {
  const [showModal, setShowModal] = useState(false);

  if (!knockoutReason) return null;

  return (
    <>
      {/* Sleek Veyra-style Alert Banner */}
      <div className="bg-rose-50 border border-rose-300 p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 bg-rose-200 text-rose-800 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-rose-900">
                [ DETERMINISTIC POLICY BREACH // KO-204 ]
              </span>
            </div>
            <p className="text-rose-950 font-bold truncate mt-0.5 m-0 font-sans">
              {knockoutReason}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-rose-900 hover:text-black bg-rose-100 hover:bg-rose-200 px-2.5 py-1 border border-rose-300 shrink-0 transition-colors cursor-pointer"
        >
          <span>POLICY SPECS</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Modal for Policy Breakdown */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E4E4E7] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#E4E4E7] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">
                  [ STATUTORY POLICY FLOOR ]
                </span>
                <h3 className="text-base font-bold text-[#0A0A0C] m-0">
                  Deterministic Knockout Rule #KO-204
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 space-y-1">
              <span className="font-mono text-[10px] uppercase text-rose-700 font-bold">
                Violation Trigger:
              </span>
              <p className="text-xs font-semibold text-rose-950 m-0">
                {knockoutReason}
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#52525B] leading-relaxed">
              <p>
                This application breached a deterministic zero-tolerance underwriting floor. High-volatility cash depletion or chronic utility payment delinquency triggers an immediate score lock of 300 to protect portfolio capital.
              </p>
              <div className="p-3 bg-[#F4F4F6] border border-[#E4E4E7] font-mono text-[11px] space-y-1 text-slate-800">
                <div className="flex items-center gap-1.5 text-black font-bold mb-1">
                  <Info className="w-3.5 h-3.5 text-[#0029FF]" />
                  <span>Configured Policy Floors:</span>
                </div>
                <div>&bull; Utility Payment Delay &gt; 25 days &rarr; Hard Reject</div>
                <div>&bull; Debit/Credit &gt; 1.05 AND Volatility &gt; 0.80 &rarr; Severe Depletion</div>
                <div>&bull; Monthly UPI Transactions &lt; 5 &rarr; Digital Footprint Floor</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-mono font-bold bg-[#0A0A0C] hover:bg-[#0029FF] text-white transition-colors cursor-pointer uppercase"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
