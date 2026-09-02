import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EvaluationRecord } from "../types/credit";
import { getStatusTheme } from "../lib/riskTheme";
import {
  X,
  History,
  Trash2,
  Download,
  Clock,
  Bike,
  Store,
  Laptop,
} from "lucide-react";
import { cn } from "../lib/utils";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: EvaluationRecord[];
  onSelectRecord: (record: EvaluationRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onClearHistory,
}) => {
  const exportHistory = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `aura_underwriting_audit_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getPersonaIcon = (type: string) => {
    switch (type) {
      case "gig_worker":
        return <Bike className="w-3.5 h-3.5 text-[#0029FF]" />;
      case "kirana_merchant":
        return <Store className="w-3.5 h-3.5 text-[#0029FF]" />;
      case "freelancer":
      default:
        return <Laptop className="w-3.5 h-3.5 text-[#0029FF]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-mono">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="w-full max-w-md bg-white border-l border-[#E4E4E7] h-full flex flex-col shadow-2xl relative z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E4E4E7] bg-[#F4F4F6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#0029FF]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0C] m-0">
                    [ SESSION AUDIT LOG ]
                  </h3>
                  <p className="text-[10px] text-[#71717A] m-0">
                    {records.length} applications evaluated
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-[#71717A] hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Bar */}
            {records.length > 0 && (
              <div className="px-5 py-2.5 bg-white border-b border-[#E4E4E7] flex items-center justify-between text-xs">
                <button
                  onClick={exportHistory}
                  className="flex items-center gap-1.5 text-[#0029FF] hover:text-black font-bold uppercase tracking-wider transition-colors cursor-pointer text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT JSON</span>
                </button>
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1.5 text-[#71717A] hover:text-rose-600 transition-colors cursor-pointer text-[11px] uppercase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR</span>
                </button>
              </div>
            )}

            {/* Records List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F4F4F6]">
              {records.length === 0 ? (
                <div className="text-center py-20 text-[#71717A] text-xs space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
                  <p className="font-bold uppercase text-[#0A0A0C]">NO AUDIT TRAILS YET</p>
                  <p className="text-[11px] text-[#71717A] max-w-xs mx-auto">
                    Evaluate an application in the workbench to generate audit logs.
                  </p>
                </div>
              ) : (
                records.map((rec) => {
                  const theme = getStatusTheme(rec.result.status);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="p-3.5 bg-white border border-[#E4E4E7] hover:border-[#0029FF] transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[#0A0A0C] font-bold">
                          {getPersonaIcon(rec.profile.borrower_type)}
                          <span className="uppercase">
                            {rec.profile.borrower_type.replace("_", " ")}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-mono px-2 py-0.5 border uppercase font-bold",
                            theme.badge
                          )}
                        >
                          {rec.result.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#52525B]">
                        <span>
                          SCORE:{" "}
                          <span className="font-bold text-[#0029FF]">
                            {rec.result.credit_score}
                          </span>
                          /900
                        </span>
                        <span>
                          PD: {(rec.result.default_probability * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-1.5 border-t border-[#E4E4E7]">
                        <span className="truncate max-w-[170px]">
                          {rec.result.application_id}
                        </span>
                        <span>{rec.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
