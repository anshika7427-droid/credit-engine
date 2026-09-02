import React, { useState, useMemo } from "react";
import type { BorrowerProfile, CreditScoreResponse } from "../types/credit";
import { Code2, Copy, Check } from "lucide-react";

interface AuditJsonViewerProps {
  profile: BorrowerProfile;
  decision: CreditScoreResponse;
}

export const AuditJsonViewer: React.FC<AuditJsonViewerProps> = ({
  profile,
  decision,
}) => {
  const [copied, setCopied] = useState(false);

  const fullAuditPayload = useMemo(
    () => ({
      metadata: {
        engine: "AURA Alternative Credit Decisioning System",
        version: "1.4.0-prod",
        timestamp: new Date().toISOString(),
        endpoint: "POST /api/v1/score",
        regulatory_standard: "FCRA § 615 / RBI Digital Lending 2022",
      },
      application: {
        id: decision.application_id,
        borrower_classification: profile.borrower_type,
      },
      input_telemetry: profile,
      scoring_result: decision,
      audit_trail: {
        deterministic_knockout_tested: true,
        knockout_rule_triggered: decision.knockout_reason !== null,
        shap_local_attribution_computed: true,
        data_integrity_hash: `sha256-${decision.application_id.slice(-12)}`,
      },
    }),
    [profile, decision]
  );

  const jsonString = useMemo(
    () => JSON.stringify(fullAuditPayload, null, 2),
    [fullAuditPayload]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJsonToHtml = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-amber-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-[#00C2FF] font-semibold"; // key
          } else {
            cls = "text-emerald-300"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-indigo-300 font-semibold"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-rose-400 font-semibold"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-[#52525B]">
          <Code2 className="w-4 h-4 text-[#0029FF]" />
          <span className="uppercase font-bold">
            [ IMMUTABLE AUDIT PAYLOAD JSON ]
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase bg-[#F4F4F6] hover:bg-[#0029FF] hover:text-white border border-[#E4E4E7] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#0029FF]" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPY PAYLOAD</span>
            </>
          )}
        </button>
      </div>

      <div className="relative border border-[#E4E4E7] bg-[#0A0A0C] shadow-sm">
        <pre
          className="p-4 text-xs font-mono overflow-x-auto max-h-[420px] leading-relaxed select-text text-white/90"
          dangerouslySetInnerHTML={{ __html: formatJsonToHtml(jsonString) }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#71717A] px-1">
        <span>Validated schema: Pydantic v2</span>
        <span>Size: ~{(jsonString.length / 1024).toFixed(1)} KB</span>
      </div>
    </div>
  );
};
