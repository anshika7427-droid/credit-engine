import React from "react";
import { ShieldAlert } from "lucide-react";

interface KnockoutBannerProps {
  knockoutReason: string | null;
}

export const KnockoutBanner: React.FC<KnockoutBannerProps> = ({
  knockoutReason,
}) => {
  if (!knockoutReason) return null;

  return (
    <div className="bg-rose-950/30 border-2 border-rose-500/60 rounded-2xl p-5 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Hard Knockout Rule Triggered
            </span>
            <span className="text-xs text-rose-400/80 font-mono">
              Policy #KO-204
            </span>
          </div>
          <h4 className="text-sm font-semibold text-rose-100 m-0">
            {knockoutReason}
          </h4>
          <p className="text-xs text-rose-300/80 leading-relaxed m-0">
            This application breached one or more zero-tolerance underwriting floors.
            Automated model scoring has been bypassed and locked to floor score (300)
            in accordance with credit policy.
          </p>
        </div>
      </div>
    </div>
  );
};
