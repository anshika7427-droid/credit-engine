import React, { useState } from "react";
import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";
import { ShapDriversChart } from "./ShapDriversChart";
import { AdverseActionNotice } from "./AdverseActionNotice";
import { AuditJsonViewer } from "./AuditJsonViewer";
import { BarChart3, FileText, Code2 } from "lucide-react";
import { cn } from "../lib/utils";

interface DecisionTabsProps {
  profile: BorrowerProfile;
  decision: CreditScoreResponse;
}

export type DecisionTabId = "shap" | "adverse" | "json";

export const DecisionTabs: React.FC<DecisionTabsProps> = ({
  profile,
  decision,
}) => {
  const [activeTab, setActiveTab] = useState<DecisionTabId>("shap");

  return (
    <div className="bg-white border border-[#E4E4E7] overflow-hidden shadow-sm">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2.5 border-b border-[#E4E4E7] bg-[#F4F4F6]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tab 1: Visual SHAP Drivers */}
          <button
            onClick={() => setActiveTab("shap")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all cursor-pointer",
              activeTab === "shap"
                ? "bg-[#0A0A0C] text-white shadow-sm"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SHAP ATTRIBUTION</span>
          </button>

          {/* Tab 2: Adverse Action Notice */}
          <button
            onClick={() => setActiveTab("adverse")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all cursor-pointer",
              activeTab === "adverse"
                ? "bg-[#0A0A0C] text-white shadow-sm"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ADVERSE NOTICE</span>
            {decision.status === "REJECTED" && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 ml-0.5" />
            )}
          </button>

          {/* Tab 3: Audit JSON */}
          <button
            onClick={() => setActiveTab("json")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all cursor-pointer",
              activeTab === "json"
                ? "bg-[#0A0A0C] text-white shadow-sm"
                : "text-[#52525B] hover:text-[#0A0A0C]"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>AUDIT JSON</span>
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="p-4 sm:p-6">
        {activeTab === "shap" && (
          <ShapDriversChart profile={profile} decision={decision} />
        )}
        {activeTab === "adverse" && (
          <AdverseActionNotice profile={profile} decision={decision} />
        )}
        {activeTab === "json" && (
          <AuditJsonViewer profile={profile} decision={decision} />
        )}
      </div>
    </div>
  );
};
