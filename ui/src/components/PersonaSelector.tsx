import React from "react";
import type { PersonaPreset } from "../types/credit";
import { PERSONA_PRESETS } from "../constants/presets";
import { Bike, Store, Laptop, AlertOctagon, UserCheck } from "lucide-react";

interface PersonaSelectorProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: PersonaPreset) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case "gig_prime":
        return <Bike className="w-4 h-4 text-emerald-400" />;
      case "kirana_solid":
        return <Store className="w-4 h-4 text-indigo-400" />;
      case "freelancer_review":
        return <Laptop className="w-4 h-4 text-amber-400" />;
      case "gig_high_risk":
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case "knockout_delinquent":
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getBadgeStyle = (id: string) => {
    switch (id) {
      case "gig_prime":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "kirana_solid":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "freelancer_review":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "gig_high_risk":
      case "knockout_delinquent":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Select Underwriting Archetype
        </span>
        <span className="text-xs text-zinc-500">
          Pre-populated alternative telemetry scenarios
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PERSONA_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-zinc-800/90 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50"
                  : "bg-[#18181b] border-[#27272a] hover:border-zinc-600 hover:bg-zinc-900/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 group-hover:scale-105 transition-transform">
                    {getIcon(preset.id)}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getBadgeStyle(
                      preset.id
                    )}`}
                  >
                    {preset.badge}
                  </span>
                </div>
                <div className="font-medium text-xs text-zinc-200 group-hover:text-white line-clamp-1">
                  {preset.name}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
