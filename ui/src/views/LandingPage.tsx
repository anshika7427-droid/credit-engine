import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Activity } from "lucide-react";
import type { BorrowerProfile, PersonaPreset } from "../types/credit";
import { PERSONA_PRESETS } from "../constants/presets";

interface LandingPageProps {
  onLaunchConsole: (preset?: PersonaPreset, customProfile?: BorrowerProfile) => void;
  backendOnline: boolean;
  backendLatency: number;
  onThemeChange?: (theme: "light" | "dark") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchConsole,
  backendOnline,
  backendLatency,
  onThemeChange,
}) => {
  // Page 02: Selected borrower persona disc
  const [selectedDiscIndex, setSelectedDiscIndex] = useState<number>(0);

  // Page 03: Active hovered accordion row
  const [hoveredRow, setHoveredRow] = useState<number>(0);

  // Section observer to update navigation theme dynamically
  const heroRef = useRef<HTMLDivElement>(null);
  const personasRef = useRef<HTMLDivElement>(null);
  const monolithRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Scroll perspective container hook for Section 2 (Persona Discs)
  const { scrollYProgress: personaScrollProgress } = useScroll({
    target: personasRef,
    offset: ["start end", "end start"],
  });

  // Smooth scale-in as section scrolls into center of viewport, scale-down as it leaves
  const personaScale = useTransform(personaScrollProgress, [0, 0.4, 0.6, 1], [0.85, 1, 1, 0.9]);
  const personaOpacity = useTransform(personaScrollProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  useEffect(() => {
    if (!onThemeChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId === "page-hero" || sectionId === "page-personas") {
              onThemeChange("light");
            } else if (sectionId === "page-monolith" || sectionId === "page-matrix") {
              onThemeChange("dark");
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    const sections = [heroRef.current, personasRef.current, monolithRef.current, matrixRef.current];
    sections.forEach((s) => {
      if (s) observer.observe(s);
    });

    return () => observer.disconnect();
  }, [onThemeChange]);

  const cubicEase = [0.25, 1, 0.5, 1] as const;

  // Borrower Persona Discs definition
  const personaDiscs = [
    {
      id: "delivery",
      num: "01",
      name: "Delivery Fleet (Ravi K.)",
      shortTitle: "Delivery Fleet",
      role: "Zomato Partner, Bangalore",
      color: "#0029FF", // Electric Klein Blue
      avatar: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=400&q=80",
      signals: "Underwritten on UPI velocity & daily fuel top-ups",
      metrics: {
        score: 780,
        turnover: "₹42,000 / mo",
        txCount: "88 UPI tx",
        regularity: "98% Punctual",
      },
      quote:
        "Zero formal bureau track record. AURA parsed daily delivery settlements to unlock an instant maintenance credit line.",
      preset: PERSONA_PRESETS[0],
    },
    {
      id: "kirana",
      num: "02",
      name: "Kirana Store (Pooja M.)",
      shortTitle: "Kirana Retail",
      role: "Store Proprietress, Lucknow",
      color: "#6366F1", // Purple Iris
      avatar: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80",
      signals: "Underwritten on merchant turnover & GST punctuality",
      metrics: {
        score: 820,
        turnover: "₹95,000 / mo",
        txCount: "115 UPI tx",
        regularity: "88% GST filing",
      },
      quote:
        "Traditional banks demanded three years of audited books. AURA verified 18 consecutive months of punctual GSTR-3B filings.",
      preset: PERSONA_PRESETS[1],
    },
    {
      id: "freelancer",
      num: "03",
      name: "Digital Freelancer (Arjun V.)",
      shortTitle: "Freelance Design",
      role: "Motion Designer, Pune",
      color: "#059669", // Forest Emerald
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      signals: "Underwritten on cross-border invoice cadence & utility streak",
      metrics: {
        score: 745,
        turnover: "₹68,000 / mo",
        txCount: "48 UPI tx",
        regularity: "99% Telecom streak",
      },
      quote:
        "Lumpy project fees frightened legacy branch officers. AURA evaluated liquidity retention and zero billing delinquency.",
      preset: PERSONA_PRESETS[2],
    },
  ];

  const currentDisc = personaDiscs[selectedDiscIndex];

  // Dark Monolith Accordion Rows
  const accordionRows = [
    {
      num: "01",
      title: "Ingests",
      summary: "Streams daily UPI transaction velocity, merchant volume, and utility discipline.",
      badge: "ACCOUNT AGGREGATOR CONSENT",
      detail:
        "Continuous API pull via the RBI Account Aggregator framework captures verified cash flow vectors without bureau dependence.",
    },
    {
      num: "02",
      title: "Knocks Out",
      summary: "Deterministic zero-tolerance logic halts capital burn before statistical scoring.",
      badge: "POLICY FLOOR #KO-204",
      detail:
        "Enforces hard regulatory policy: utility payment delay > 25 days or high cash burn automatically triggers an immediate 300 score lock.",
    },
    {
      num: "03",
      title: "Scores",
      summary: "LightGBM gradient booster generates 300–900 calibrated credit scores.",
      badge: "150-TREE GRADIENT ENSEMBLE",
      detail:
        "Calculates default probabilities trained on 10,000+ alternative credit histories, achieving 82%+ Gini separation.",
    },
    {
      num: "04",
      title: "Explains",
      summary: "TreeSHAP attribution outputs regulatory Adverse Action codes automatically.",
      badge: "FCRA § 615 & RBI DLG",
      detail:
        "Zero black-box mystery: provides point-by-point feature impact attribution and immediate adverse disclosure letterheads for declined files.",
    },
  ];

  return (
    <div className="w-full selection:bg-[#0029FF] selection:text-white font-sans bg-[#F4F4F6]">
      {/* ========================================================================= */}
      {/* FRAME 2: PAGE 01 — ASYMMETRICAL SPLIT HERO (00:02 - 00:06)                */}
      {/* ========================================================================= */}
      <section
        id="page-hero"
        ref={heroRef}
        className="min-h-screen lg:h-screen w-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#F4F4F6] relative pt-24"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
          {/* Left Column: Asymmetrical Editorial Headline & Metric Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.8, ease: cubicEase }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Small Monospace Tag */}
            <div className="font-mono text-xs uppercase tracking-widest text-[#52525B]">
              [ 01 // AUTONOMOUS CREDIT OS ]
            </div>

            {/* Massive Swiss Typography */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-[#0A0A0C] leading-[1.04]">
              Alternative Credit for the Next Billion.
            </h1>

            {/* Signature Solid Blue Block */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0029FF] text-white p-6 sm:p-8 shadow-sm cursor-default"
            >
              <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tighter leading-none mb-2">
                84%
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-white/90 font-semibold leading-relaxed">
                INSTANT UNDERWRITING FOR UNBANKED GIG WORKERS
              </div>
            </motion.div>

            {/* Micro Footer Action Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E4E4E7]">
              <button
                onClick={() => onLaunchConsole()}
                className="font-mono text-xs uppercase tracking-widest font-bold text-[#0A0A0C] hover:text-[#0029FF] transition-colors flex items-center gap-2 cursor-pointer group"
              >
                <span>TEST IN CONSOLE</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              <span className="font-mono text-[11px] text-[#71717A] uppercase">
                {backendOnline ? `FASTAPI 8000 (${backendLatency || 14}MS)` : "ENGINE READY (14MS)"} &bull; ZERO PII
              </span>
            </div>
          </motion.div>

          {/* Right Column: The Floating Kinetic Orb Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: cubicEase }}
            className="lg:col-span-6 flex justify-center"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E4E4E7] shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden space-y-6">
              {/* Orb Header Status */}
              <div className="w-full flex items-center justify-between text-xs font-mono pb-3 border-b border-[#E4E4E7]">
                <span className="text-[#52525B] uppercase tracking-wider">
                  TELEMETRY STREAM
                </span>
                <div className="flex items-center gap-2 text-[#0029FF] font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0029FF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0029FF]" />
                  </span>
                  <span>ACTIVE</span>
                </div>
              </div>

              {/* Kinetic Animated Rotating Sphere with Radar Rings */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
                <svg
                  className="w-full h-full animate-[spin_18s_linear_infinite]"
                  viewBox="0 0 240 240"
                >
                  <defs>
                    <radialGradient id="veyraOrb" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#00C2FF" />
                      <stop offset="45%" stopColor="#0029FF" />
                      <stop offset="100%" stopColor="#0A1128" />
                    </radialGradient>
                  </defs>
                  {/* Concentric Radar Rings */}
                  <circle cx="120" cy="120" r="115" fill="none" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="4 6" />
                  <circle cx="120" cy="120" r="102" fill="url(#veyraOrb)" />
                  <circle cx="120" cy="120" r="80" fill="none" stroke="#00C2FF" strokeWidth="0.75" strokeDasharray="3 6" className="opacity-40" />
                </svg>

                {/* Frosted Status Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-md border border-white/60 shadow-lg flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#0029FF] animate-pulse" />
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#0A0A0C] tracking-widest uppercase">
                      TELEMETRY STREAM: ACTIVE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/90 mt-2 font-medium tracking-widest">
                    UPI &bull; GST &bull; TELECOM
                  </span>
                </div>
              </div>

              {/* Micro-Action Button to launch console */}
              <button
                onClick={() => onLaunchConsole()}
                className="w-full bg-[#0029FF] hover:bg-black text-white transition-all py-3.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 shadow-sm group"
              >
                <span>LAUNCH LIVE CONSOLE ↗</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="text-center text-[10px] font-mono text-[#71717A] tracking-widest uppercase pb-2">
          &darr; SCROLL FOR BORROWER ARCHETYPES
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FRAME 3: PAGE 02 — INTERACTIVE PERSONA DISC SLIDER (00:06 - 00:10)        */}
      {/* Scroll-Driven Zoom-In & Zoom-Out with Active Kinetic Scaling              */}
      {/* ========================================================================= */}
      <section
        id="page-personas"
        ref={personasRef}
        className="min-h-screen lg:h-screen w-full bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-20 border-t border-[#E4E4E7] relative py-20 overflow-hidden"
      >
        <motion.div
          style={{ scale: personaScale, opacity: personaOpacity }}
          className="max-w-7xl mx-auto w-full space-y-10"
        >
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#52525B]">
              [ 02 // BORROWER ARCHETYPES ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0C]">
              Underwritten for Every Invisible Hustle.
            </h2>
            <p className="text-sm text-[#71717A] font-mono">
              Hover or click any circular disc below to inspect real-time cashflow vectors:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Horizontal Discs Carousel (Left 7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {personaDiscs.map((disc, idx) => {
                const isSelected = selectedDiscIndex === idx;

                return (
                  <motion.div
                    key={disc.id}
                    onClick={() => setSelectedDiscIndex(idx)}
                    animate={{
                      scale: isSelected ? 1.08 : 0.95,
                    }}
                    whileHover={{ scale: isSelected ? 1.08 : 1.02 }}
                    transition={{ duration: 0.25, ease: cubicEase }}
                    className={`p-6 border transition-all cursor-pointer flex flex-col items-center text-center space-y-4 relative overflow-hidden rounded-2xl ${
                      isSelected
                        ? "bg-white border-2 border-[#0029FF] shadow-[0_20px_50px_rgba(0,41,255,0.14)] z-10"
                        : "bg-[#F9FAFB] border-[#E4E4E7] opacity-60 hover:opacity-100 hover:border-slate-400"
                    }`}
                  >
                    {/* Disc Number Tag */}
                    <span className="font-mono text-[10px] text-[#71717A] uppercase tracking-widest font-bold">
                      DISC {disc.num}
                    </span>

                    {/* Circular Organic Disc with Rotating Aura Ring on Active */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {isSelected ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#0029FF]"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-[#0029FF]/10 blur-sm"
                          />
                        </>
                      ) : null}

                      <div
                        className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow-sm transition-all duration-300 ${
                          isSelected ? "scale-105" : "scale-95"
                        }`}
                        style={{ borderColor: disc.color }}
                      >
                        <img
                          src={disc.avatar}
                          alt={disc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Disc Metadata */}
                    <div>
                      <h4 className="font-bold text-sm text-[#0A0A0C] m-0">
                        {disc.shortTitle}
                      </h4>
                      <p className="text-[11px] text-[#71717A] font-mono mt-0.5 m-0 truncate max-w-[150px]">
                        {disc.role}
                      </p>
                    </div>

                    {/* Disc Score Pill */}
                    <span
                      className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${disc.color}15`,
                        color: disc.color,
                        borderColor: `${disc.color}40`,
                      }}
                    >
                      SCORE: {disc.metrics.score}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Live Metrics Panel for Selected Disc (Right 5 Cols) with AnimatePresence */}
            <div className="lg:col-span-5 min-h-[360px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDisc.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#F4F4F6] border border-[#E4E4E7] p-6 sm:p-8 space-y-5 shadow-sm rounded-2xl"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#71717A] tracking-wider block">
                        TELEMETRY PROFILE // {currentDisc.num}
                      </span>
                      <h3 className="text-lg font-bold text-[#0A0A0C] m-0">
                        {currentDisc.name}
                      </h3>
                    </div>
                    <span
                      className="font-mono text-xs font-bold px-3 py-1 text-white rounded"
                      style={{ backgroundColor: currentDisc.color }}
                    >
                      VERIFIED
                    </span>
                  </div>

                  {/* Quote */}
                  <p
                    className="text-xs text-[#52525B] italic leading-relaxed m-0 border-l-2 pl-3"
                    style={{ borderColor: currentDisc.color }}
                  >
                    &ldquo;{currentDisc.quote}&rdquo;
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-white p-3 border border-[#E4E4E7] rounded-lg">
                      <span className="text-[10px] text-[#71717A] uppercase block">Monthly Cashflow</span>
                      <span className="font-bold text-[#0A0A0C]">{currentDisc.metrics.turnover}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#E4E4E7] rounded-lg">
                      <span className="text-[10px] text-[#71717A] uppercase block">Frequency</span>
                      <span className="font-bold text-[#0A0A0C]">{currentDisc.metrics.txCount}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#E4E4E7] rounded-lg">
                      <span className="text-[10px] text-[#71717A] uppercase block">Discipline Factor</span>
                      <span className="font-bold text-[#0029FF]">{currentDisc.metrics.regularity}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#E4E4E7] rounded-lg">
                      <span className="text-[10px] text-[#71717A] uppercase block">Underwritten Score</span>
                      <span className="font-bold text-[#0A0A0C]">{currentDisc.metrics.score} / 900</span>
                    </div>
                  </div>

                  {/* Connect Persona CTA: Immediately switches currentView to console and auto-fills profile */}
                  <button
                    onClick={() => onLaunchConsole(currentDisc.preset)}
                    className="w-full py-3.5 bg-[#0029FF] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-sm group"
                  >
                    <span>TEST THIS ARCHETYPE IN WORKBENCH &rarr;</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* FRAME 4: PAGE 03 — THE DARK MONOLITH ACCORDION (00:10 - 00:15)            */}
      {/* ========================================================================= */}
      <section
        id="page-monolith"
        ref={monolithRef}
        className="min-h-screen lg:h-screen w-full bg-[#0A0A0C] text-white flex flex-col justify-center px-6 sm:px-12 md:px-20 relative py-20"
      >
        <div className="max-w-7xl mx-auto w-full space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: cubicEase }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6"
          >
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#0029FF] font-bold">
                [ HOW IT WORKS ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight m-0">
                Built to Ingest. Calibrated to Protect.
              </h2>
            </div>
            <p className="text-xs text-white/50 font-mono max-w-sm m-0">
              Four sequential pipeline stages converting raw digital telemetry into legally auditable capital determinations.
            </p>
          </motion.div>

          {/* Interactive 4-Row Hover Accordion with Electric Blue Illumination */}
          <div className="divide-y divide-white/10">
            {accordionRows.map((row, idx) => {
              const isHovered = hoveredRow === idx;

              return (
                <div
                  key={row.num}
                  onMouseEnter={() => setHoveredRow(idx)}
                  className={`py-6 sm:py-7 transition-all cursor-pointer group px-4 -mx-4 ${
                    isHovered ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Index + Title */}
                    <div className="flex items-center gap-6 md:w-1/3">
                      <span
                        className={`font-mono text-sm sm:text-base font-bold transition-colors ${
                          isHovered ? "text-[#0029FF]" : "text-white/30 group-hover:text-white"
                        }`}
                      >
                        {row.num}.
                      </span>
                      <h3
                        className={`text-xl sm:text-3xl font-bold tracking-tight transition-colors m-0 ${
                          isHovered ? "text-[#0029FF]" : "text-white group-hover:text-[#0029FF]"
                        }`}
                      >
                        {row.title} &rarr;
                      </h3>
                    </div>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed md:w-1/2 m-0">
                      {row.summary}
                    </p>

                    {/* Badge */}
                    <div className="md:w-1/6 flex justify-start md:justify-end">
                      <span
                        className={`font-mono text-[10px] uppercase px-2.5 py-1 tracking-wider border transition-colors ${
                          isHovered
                            ? "bg-[#0029FF] text-white border-[#0029FF]"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}
                      >
                        {row.badge}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="pt-3 pl-12 text-xs font-mono text-white/50"
                    >
                      &bull; {row.detail}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FRAME 5: PAGE 04 — THE KLEIN BLUE IMPACT MATRIX (00:15 - 00:19)           */}
      {/* ========================================================================= */}
      <section
        id="page-matrix"
        ref={matrixRef}
        className="min-h-screen lg:h-screen w-full bg-[#0029FF] text-white flex flex-col justify-center px-6 sm:px-12 md:px-20 relative py-20"
      >
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: cubicEase }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/20 pb-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-semibold block mb-1">
                [ 04 // BENCHMARKS &amp; PRECISION ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white m-0">
                AURA Delivers Mathematical Precision With Every Vector.
              </h2>
            </div>
            <span className="font-mono text-[11px] text-white/80 uppercase">
              10,000+ AUDITED PROFILES
            </span>
          </motion.div>

          {/* 3 High-Contrast Horizontal Comparative Metric Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20 pt-2">
            {/* Metric 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3 pt-4 md:pt-0 md:pr-6"
            >
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter">
                4x
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Faster Decision Velocity
              </h3>
              <div className="font-mono text-xs text-white/80 pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Traditional Bureau:</span>
                  <span className="line-through text-white/60">5–7 Days</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>AURA Engine:</span>
                  <span>138ms Instant</span>
                </div>
              </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3 pt-6 md:pt-0 md:px-6"
            >
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter">
                80%
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Reduction in Manual Bureau Rejections
              </h3>
              <div className="font-mono text-xs text-white/80 pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Traditional Bureau:</span>
                  <span className="line-through text-white/60">Thin-File Rejection</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>AURA Engine:</span>
                  <span>Cashflow Underwritten</span>
                </div>
              </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3 pt-6 md:pt-0 md:pl-6"
            >
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter">
                60%
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Growth in Underwritten Loan Disbursals
              </h3>
              <div className="font-mono text-xs text-white/80 pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Deterministic Knockout:</span>
                  <span className="text-white/80">0 Capital Burn</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>Model Transparency:</span>
                  <span>100% TreeSHAP</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* White Action Pill Button: Switches directly to console */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/20">
            <div className="font-mono text-xs text-white/80 uppercase">
              FCRA § 615 COMPLIANT &bull; RBI ACCOUNT AGGREGATOR CONSENT
            </div>

            <button
              onClick={() => onLaunchConsole()}
              className="bg-white text-[#0029FF] hover:bg-black hover:text-white px-9 py-4 font-mono font-bold text-xs uppercase tracking-widest transition-all rounded-full shadow-lg cursor-pointer flex items-center gap-2 group"
            >
              <span>OPEN CONSOLE WORKSPACE ↗</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
