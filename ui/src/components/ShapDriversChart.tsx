import React from "react";
import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";
import { computeShapPointAttributions } from "../lib/shapPoints";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "../lib/utils";

interface ShapDriversChartProps {
  profile: BorrowerProfile;
  decision: CreditScoreResponse;
}

export const ShapDriversChart: React.FC<ShapDriversChartProps> = ({
  profile,
  decision,
}) => {
  const isKnockout = Boolean(decision.knockout_reason);
  const { drivers, positives, negatives, netImpact } =
    computeShapPointAttributions(profile, isKnockout);

  const totalPositivePoints = positives.reduce((sum, d) => sum + d.points, 0);
  const totalNegativePoints = negatives.reduce((sum, d) => sum + d.points, 0);

  const maxAbsPoints = Math.max(
    ...drivers.map((d) => Math.abs(d.points)),
    100
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-steel-tint border border-steel-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-steel-primary shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-steel-primary font-bold block">
                POSITIVE SCORE LIFT
              </span>
              <span className="text-base font-extrabold text-steel-primary">
                +{totalPositivePoints} PTS
              </span>
            </div>
          </div>
          <span className="text-[10px] text-steel-primary bg-vapor-card px-2 py-0.5 border border-steel-primary/30 font-semibold">
            {positives.length} DRIVERS
          </span>
        </div>

        <div className="p-3.5 bg-rose-50/60 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-rose-800 font-bold block">
                NEGATIVE RISK DRAG
              </span>
              <span className="text-base font-extrabold text-rose-800">
                {totalNegativePoints} PTS
              </span>
            </div>
          </div>
          <span className="text-[10px] text-rose-800 bg-vapor-card px-2 py-0.5 border border-rose-200 font-semibold">
            {negatives.length} FLAGS
          </span>
        </div>

        <div className="p-3.5 bg-vapor-subtle border border-vapor-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-steel-muted font-bold block">
              NET SCORE SHIFT
            </span>
            <span
              className={cn(
                "text-base font-extrabold",
                netImpact >= 0 ? "text-steel-primary" : "text-rose-700"
              )}
            >
              {netImpact >= 0 ? `+${netImpact}` : netImpact} PTS
            </span>
          </div>
          <span className="text-[10px] text-steel-muted bg-vapor-card px-2 py-0.5 border border-vapor-border">
            BASE: 580
          </span>
        </div>
      </div>

      {/* Feature Weights Breakdown */}
      <div className="bg-vapor-card border border-vapor-border p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-vapor-border">
          <span className="font-bold text-steel-ink">
            [ TREESHAP ATTRIBUTION VECTOR BREAKDOWN ]
          </span>
          <span className="text-[10px] text-steel-muted">
            TEAL: LIFT &bull; RED: RISK
          </span>
        </div>

        <div className="space-y-3">
          {drivers.map((driver) => {
            const isPositive = driver.points >= 0;
            const barPct = Math.round(
              (Math.abs(driver.points) / maxAbsPoints) * 100
            );

            return (
              <div key={driver.featureKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-steel-ink font-sans">
                      {driver.label}
                    </span>
                    <span className="text-[10px] text-steel-muted bg-vapor-subtle px-1.5 py-0.5 border border-vapor-border">
                      {driver.displayValue}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "font-bold text-xs px-2 py-0.5",
                      isPositive
                        ? "text-steel-primary bg-steel-tint border border-steel-primary/30"
                        : "text-rose-700 bg-rose-50 border border-rose-200"
                    )}
                  >
                    {isPositive ? `+${driver.points} pts` : `${driver.points} pts`}
                  </span>
                </div>

                <div className="w-full bg-vapor-subtle h-1.5 overflow-hidden flex border border-vapor-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isPositive ? "bg-steel-primary" : "bg-rose-600"
                    )}
                    style={{ width: `${Math.max(4, barPct)}%` }}
                  />
                </div>

                <p className="text-[11px] text-steel-muted font-sans m-0 leading-tight">
                  {driver.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-steel-muted px-1">
        <Info className="w-3 h-3 text-steel-primary shrink-0" />
        <span>
          Computed via TreeSHAP tree explainer with exact Shapley attributions.
        </span>
      </div>
    </div>
  );
};
