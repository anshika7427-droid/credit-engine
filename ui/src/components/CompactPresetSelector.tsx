import React from "react";
import type { PersonaPreset } from "../types/credit";
import { PERSONA_PRESETS } from "../constants/presets";

interface CompactPresetSelectorProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: PersonaPreset) => void;
}

export const CompactPresetSelector: React.FC<CompactPresetSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#52525B]">
            [ BORROWER TELEMETRY PRESETS ]
          </span>
          <span className="text-[11px] text-[#71717A] font-mono hidden md:inline">
            // Select scenario to auto-fill inputs
          </span>
        </div>
      </div>

      {/* High-Contrast Razor Hairline Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {PERSONA_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center gap-3 px-4 py-3 border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#0029FF] text-white border-[#0029FF] shadow-sm"
                  : "bg-white text-[#0A0A0C] border-[#E4E4E7] hover:border-[#0029FF] hover:bg-[#F4F4F6]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`text-xs font-bold font-mono uppercase truncate ${
                      isSelected ? "text-white" : "text-[#0A0A0C]"
                    }`}
                  >
                    {preset.shortName || preset.name}
                  </div>
                  {preset.badge && (
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-[#F4F4F6] text-[#52525B] border-[#E4E4E7]"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] font-mono truncate mt-0.5 ${
                    isSelected ? "text-white/80" : "text-[#71717A]"
                  }`}
                >
                  {preset.personName || preset.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
