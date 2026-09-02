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
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-steel-muted">
            [ BORROWER TELEMETRY PRESETS ]
          </span>
          <span className="text-[11px] text-steel-muted font-mono hidden md:inline">
            // Select scenario to auto-fill inputs
          </span>
        </div>
      </div>

      {/* High-Contrast Hairline Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {PERSONA_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center gap-3 px-4 py-3 border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-steel-primary text-white border-steel-primary shadow-sm"
                  : "bg-vapor-card text-steel-ink border-vapor-border hover:border-steel-primary hover:bg-vapor-subtle"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`text-xs font-bold font-mono uppercase truncate ${
                      isSelected ? "text-white" : "text-steel-ink"
                    }`}
                  >
                    {preset.shortName || preset.name}
                  </div>
                  {preset.badge && (
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-vapor-subtle text-steel-muted border-vapor-border"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] font-mono truncate mt-0.5 ${
                    isSelected ? "text-steel-tint" : "text-steel-muted"
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
