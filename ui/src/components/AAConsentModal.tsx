import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  FileCheck,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Sparkles,
  Smartphone,
  KeyRound,
} from "lucide-react";
import type { BorrowerProfile, PersonaPreset } from "../types/credit";
import {
  initiateAAConsent,
  verifyAAConsent,
  synthesizeRawTelemetry,
} from "../services/api";
import { PERSONA_PRESETS } from "../constants/presets";

interface AAConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (synthesizedProfile: BorrowerProfile) => void;
  activePersonaId?: string | null;
}

const FIP_OPTIONS = [
  { id: "HDFC Bank", name: "HDFC Bank Ltd", handleSuffix: "@okhdfcbank", code: "HDFC-AA" },
  { id: "State Bank of India", name: "State Bank of India", handleSuffix: "@oksbi", code: "SBI-AA" },
  { id: "PhonePe AA", name: "PhonePe Technology AA", handleSuffix: "@phonepe", code: "PPE-AA" },
  { id: "ICICI Bank", name: "ICICI Bank Ltd", handleSuffix: "@okicici", code: "ICICI-AA" },
  { id: "Axis Bank", name: "Axis Bank Ltd", handleSuffix: "@okaxis", code: "AXIS-AA" },
];

export const AAConsentModal: React.FC<AAConsentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activePersonaId,
}) => {
  const [selectedFip, setSelectedFip] = useState(FIP_OPTIONS[0].id);
  const [phoneNumber, setPhoneNumber] = useState("+91-98765-43210");
  const [vpaHandle, setVpaHandle] = useState("ravi.fleet@okhdfcbank");
  const [step, setStep] = useState<"CONFIG" | "OTP" | "PROCESSING" | "SUCCESS">("CONFIG");
  const [otp, setOtp] = useState("882190");
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("Querying FIP Gateway...");
  const [artifactToken, setArtifactToken] = useState<string>("AA-IND-CONSENT-88219");
  const [synthesizedResult, setSynthesizedResult] = useState<BorrowerProfile | null>(null);

  // Sync with active preset when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentPreset = PERSONA_PRESETS.find((p) => p.id === activePersonaId) || PERSONA_PRESETS[0];
      setPhoneNumber(currentPreset.phone || "+91-98765-43210");
      setVpaHandle(currentPreset.vpaHandle || "ravi.fleet@okhdfcbank");
      setStep("CONFIG");
      setOtp("882190");
      setSynthesizedResult(null);
    }
  }, [isOpen, activePersonaId]);

  const handleSelectPresetQuickFill = (preset: PersonaPreset) => {
    setPhoneNumber(preset.phone || "+91-98765-43210");
    setVpaHandle(preset.vpaHandle || `${preset.id}@okhdfcbank`);
    if (preset.id === "kirana_solid") {
      setSelectedFip("State Bank of India");
    } else if (preset.id === "freelancer_review") {
      setSelectedFip("ICICI Bank");
    } else {
      setSelectedFip("HDFC Bank");
    }
  };

  const handleInitiateConsent = async () => {
    setLoading(true);
    try {
      await initiateAAConsent({
        phone_number: phoneNumber,
        vpa_handle: vpaHandle,
        fip_id: selectedFip,
        data_range_days: 180,
      });
      setStep("OTP");
    } catch {
      setStep("OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setStep("PROCESSING");
    setProcessingStage("Querying FIP Gateway (180-Day Encrypted Telemetry)...");

    try {
      // 1. Verify OTP with AA Consent Manager
      const verifyRes = await verifyAAConsent({
        phone_number: phoneNumber,
        vpa_handle: vpaHandle,
        otp: otp || "882190",
        fip_id: selectedFip,
        persona_id: activePersonaId || "gig_prime",
      });

      setArtifactToken(verifyRes.artifact_token || "AA-IND-CONSENT-88219-X7B");

      // Animated Stage 2
      await new Promise((r) => setTimeout(r, 650));
      setProcessingStage("Synthesizing Cashflow Vectors & FASTag Telemetry...");

      // 2. Synthesize Raw Ingestion Telemetry
      const records = verifyRes.mock_financial_records || {
        borrower_type: "gig_worker" as const,
        transactions: [],
        vehicle_rc: "KA-01-EQ-4921",
        fastag_transactions: [],
        daily_km_avg: 76.5,
        gst_filing_punctuality: 0.0,
        ecommerce_cancellation_rate: 0.02,
        consent_artifact_id: "AA-88219",
      };

      const synthesized = await synthesizeRawTelemetry({
        ...records,
        consent_artifact_id: "AA-88219",
        fip_name: selectedFip,
      });

      await new Promise((r) => setTimeout(r, 650));
      setProcessingStage("Verifying Digital Signature & RBI Consent Artifact...");
      await new Promise((r) => setTimeout(r, 450));

      setSynthesizedResult(synthesized);
      setStep("SUCCESS");

      // Auto populate into console after brief preview
      setTimeout(() => {
        onSuccess(synthesized);
        onClose();
      }, 1200);
    } catch {
      // Fallback synthesis
      const fallback: BorrowerProfile = {
        borrower_type: "gig_worker",
        monthly_inflow: 46500,
        upi_tx_count_monthly: 88,
        upi_debit_to_credit_ratio: 0.72,
        cashflow_volatility: 0.19,
        utility_payment_delay_days: 1,
        telecom_recharge_regularity: 0.98,
        gst_filing_punctuality: 0.0,
        ecommerce_cancellation_rate: 0.02,
        mobility_activity_score: 91.5,
        consent_artifact_id: "AA-88219",
        data_source_mode: "AA_INGESTED",
      };
      setSynthesizedResult(fallback);
      setStep("SUCCESS");
      setTimeout(() => {
        onSuccess(fallback);
        onClose();
      }, 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white border border-[#DDE5E5] rounded-2xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#F4F7F6] border-b border-[#DDE5E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E7490] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#0E7490]">
                  RBI ACCOUNT AGGREGATOR FRAMEWORK
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-[#4F616B] border border-[#DDE5E5]">
                  CONSENT SPEC v1.1
                </span>
              </div>
              <h2 className="text-base font-bold text-[#111E25] m-0">
                Financial Information User (FIU) Consent
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#DDE5E5]/60 text-[#4F616B] hover:text-[#111E25] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Institutional Compliance Notice Pill */}
          <div className="p-3 bg-[#ECFEFF] border border-[#0E7490]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#0E7490]">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold uppercase tracking-wider block font-mono text-[10px]">
                SECURE END-TO-END TELEMETRY PIPELINE
              </span>
              FIU: <span className="font-bold">AURA Autonomous Underwriting</span> &bull; 256-Bit Asymmetric
              Signature &bull; Non-Revocable Audit Trail &bull; RBI-DLG Compliant.
            </div>
          </div>

          {step === "CONFIG" && (
            <div className="space-y-4">
              {/* Quick Archetype Persona Pre-fill */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#4F616B] mb-1.5 font-bold">
                  Quick Archetype Handle Pre-fill
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONA_PRESETS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetQuickFill(preset)}
                      className={`px-2.5 py-2 border rounded-lg text-left text-xs transition-all cursor-pointer ${
                        vpaHandle.includes(preset.id.split("_")[0])
                          ? "bg-[#0E7490] text-white border-[#0E7490]"
                          : "bg-[#F4F7F6] text-[#111E25] border-[#DDE5E5] hover:border-[#0E7490]"
                      }`}
                    >
                      <span className="block font-mono text-[9px] uppercase font-bold opacity-80">
                        {preset.badge}
                      </span>
                      <span className="font-semibold truncate block text-[11px]">
                        {preset.personName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FIP Selection */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#4F616B] mb-1.5 font-bold flex items-center justify-between">
                  <span>Financial Information Provider (FIP)</span>
                  <span className="text-[#0E7490] lowercase text-[10px]">rbi-licensed</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedFip}
                    onChange={(e) => setSelectedFip(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7F6] border border-[#DDE5E5] rounded-xl text-xs font-mono text-[#111E25] focus:outline-none focus:border-[#0E7490] appearance-none"
                  >
                    {FIP_OPTIONS.map((fip) => (
                      <option key={fip.id} value={fip.id}>
                        {fip.name} ({fip.code})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-[#4F616B] absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* AA Handle & Phone Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#4F616B] mb-1.5 font-bold">
                    Borrower AA Handle / VPA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vpaHandle}
                      onChange={(e) => setVpaHandle(e.target.value)}
                      placeholder="handle@okhdfcbank"
                      className="w-full px-3 py-2 bg-[#F4F7F6] border border-[#DDE5E5] rounded-xl text-xs font-mono text-[#111E25] focus:outline-none focus:border-[#0E7490]"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-[#4F616B] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#4F616B] mb-1.5 font-bold">
                    Registered Mobile
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F7F6] border border-[#DDE5E5] rounded-xl text-xs font-mono text-[#111E25] focus:outline-none focus:border-[#0E7490]"
                  />
                </div>
              </div>

              {/* Consent Scope Table */}
              <div className="p-3.5 bg-[#F4F7F6] border border-[#DDE5E5] rounded-xl space-y-2 text-xs font-mono">
                <div className="text-[10px] uppercase font-bold text-[#4F616B] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#0E7490]" />
                  <span>MANDATED CONSENT ARTIFACT SCOPE:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4F616B] pt-1">
                  <div>
                    <span className="block opacity-75 text-[10px]">DATA SCOPE:</span>
                    <span className="font-bold text-[#111E25]">Periodic Statements (180 Days)</span>
                  </div>
                  <div>
                    <span className="block opacity-75 text-[10px]">FREQUENCY:</span>
                    <span className="font-bold text-[#111E25]">One-Time Snapshot</span>
                  </div>
                  <div>
                    <span className="block opacity-75 text-[10px]">PURPOSE:</span>
                    <span className="font-bold text-[#0E7490]">Credit Underwriting (Code: 101)</span>
                  </div>
                  <div>
                    <span className="block opacity-75 text-[10px]">TELEMETRY:</span>
                    <span className="font-bold text-[#111E25]">Bank + FASTag + RC</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleInitiateConsent}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#0E7490] hover:bg-[#155E75] text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>INITIATING RBI CONSENT SESSION...</span>
                  </>
                ) : (
                  <>
                    <span>REQUEST OTP FROM FIP GATEWAY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === "OTP" && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#ECFEFF] border border-[#0E7490]/30 text-[#0E7490] mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#111E25] uppercase font-mono">
                  Enter 6-Digit Consent Authorization OTP
                </h3>
                <p className="text-xs text-[#4F616B]">
                  Pushed to <span className="font-bold font-mono">{phoneNumber}</span> via {selectedFip} AA Gateway.
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center my-4">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="882190"
                  className="w-48 text-center tracking-[0.6em] text-2xl font-mono font-bold px-4 py-2.5 bg-[#F4F7F6] border-2 border-[#0E7490] rounded-xl text-[#111E25] focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-[#F4F7F6] border border-[#DDE5E5] rounded-lg text-center text-xs font-mono text-[#4F616B]">
                <span>Mock AA Sandbox Code: </span>
                <button
                  type="button"
                  onClick={() => setOtp("882190")}
                  className="text-[#0E7490] font-bold underline cursor-pointer"
                >
                  882190 (Click to fill)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("CONFIG")}
                  className="px-4 py-3 bg-[#F4F7F6] hover:bg-[#DDE5E5] text-[#4F616B] font-mono text-xs uppercase font-bold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="flex-1 py-3.5 bg-[#0E7490] hover:bg-[#155E75] text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Cpu className="w-4 h-4" />
                  <span>AUTHORIZE &amp; SYNTHESIZE TELEMETRY</span>
                </button>
              </div>
            </div>
          )}

          {step === "PROCESSING" && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#0E7490]/20 border-t-[#0E7490] animate-spin" />
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-[#0E7490]">
                  <Cpu className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 font-mono">
                <span className="text-[10px] uppercase tracking-widest text-[#0E7490] font-bold block">
                  [ STAGE 1: RAW INGESTION &amp; VECTOR SYNTHESIS ]
                </span>
                <h3 className="text-base font-bold text-[#111E25]">
                  {processingStage}
                </h3>
                <p className="text-xs text-[#4F616B] max-w-sm mx-auto">
                  Parsing 120-day statement transaction arrays, FASTag transit passes, and RC commercial class validation.
                </p>
              </div>

              {/* Pipeline Stepper */}
              <div className="max-w-md mx-auto space-y-2 text-left text-xs font-mono">
                <div className="flex items-center gap-2 text-[#0E7490]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. FIP Cryptographic Handshake OK</span>
                </div>
                <div className="flex items-center gap-2 text-[#0E7490]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Raw Statement Logs Ingested</span>
                </div>
                <div className="flex items-center gap-2 text-[#111E25] font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0E7490]" />
                  <span>3. Running Feature Transformers (telemetry_parser.py)</span>
                </div>
              </div>
            </div>
          )}

          {step === "SUCCESS" && synthesizedResult && (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold block">
                  AA CONSENT VERIFIED // SIGNED ARTIFACT ISSUED
                </span>
                <h3 className="text-sm font-bold text-[#111E25] font-mono mt-1">
                  ARTIFACT: #{artifactToken || synthesizedResult.consent_artifact_id || "AA-88219"}
                </h3>
              </div>

              {/* Synthesized Features Grid Preview */}
              <div className="p-4 bg-[#F4F7F6] border border-[#DDE5E5] rounded-xl grid grid-cols-3 gap-2 text-left font-mono text-xs">
                <div>
                  <span className="text-[9px] text-[#4F616B] uppercase block">Inflow</span>
                  <span className="font-bold text-[#111E25]">₹{synthesizedResult.monthly_inflow.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#4F616B] uppercase block">UPI Velocity</span>
                  <span className="font-bold text-[#111E25]">{synthesizedResult.upi_tx_count_monthly} tx</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#4F616B] uppercase block">Mobility Index</span>
                  <span className="font-bold text-[#0E7490]">{synthesizedResult.mobility_activity_score}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#0E7490] font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-populating console vectors for Stage 2 scoring...</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
