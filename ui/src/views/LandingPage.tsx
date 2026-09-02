import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
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
}) => {
  // Page 02: Selected borrower persona disc
  const [selectedDiscIndex, setSelectedDiscIndex] = useState<number>(0);

  // Page 03: Active hovered/clicked accordion row
  const [activeAccordionRow, setActiveAccordionRow] = useState<number>(0);

  // Section references
  const heroRef = useRef<HTMLDivElement>(null);
  const personasRef = useRef<HTMLDivElement>(null);
  const monolithRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Track scroll position across the hero container
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"], // Triggers as hero leaves top of viewport
  });

  // Scale down and fade as the user scrolls into Section 2
  const cardScale = useTransform(heroScrollProgress, [0, 0.5, 1], [1, 0.95, 0.85]);
  const cardOpacity = useTransform(heroScrollProgress, [0, 0.7, 1], [1, 0.9, 0.3]);

  // Scroll perspective container hook for Section 2 (Persona Discs)
  // Zooms up from scale: 0.9 to 1.0 as it scrolls into viewport center, and scales down to 0.92 on exit
  const { scrollYProgress: personaScrollProgress } = useScroll({
    target: personasRef,
    offset: ["start end", "end start"],
  });

  const personaScale = useTransform(
    personaScrollProgress,
    [0, 0.4, 0.6, 1],
    [0.9, 1.0, 1.0, 0.92]
  );
  const personaOpacity = useTransform(
    personaScrollProgress,
    [0, 0.25, 0.75, 1],
    [0.5, 1.0, 1.0, 0.5]
  );

  const cubicEase = [0.25, 1, 0.5, 1] as const;

  const cardPopVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 35, 
      scale: 0.9,
    },
    visible: (customDelay: number) => ({
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 110,
        damping: 14,
        mass: 0.8,
        delay: customDelay,
      },
    }),
  };

  // Borrower Persona Discs definition (Steel Teal & Vapor)
  const personaDiscs = [
    {
      id: "delivery",
      num: "01",
      name: "Delivery Fleet (Ravi K.)",
      shortTitle: "Delivery Fleet",
      role: "Zomato Partner, Bangalore",
      color: "#0E7490", // Steel Teal Primary
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
      color: "#0284C7", // Cyan / Deep Sky
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
      color: "#0D9488", // Deep Teal
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
    <div className="w-full selection:bg-[#ECFEFF] selection:text-[#0E7490] font-sans bg-[#F4F7F6]">
      {/* ========================================================================= */}
      {/* FRAME 2: PAGE 01 — ASYMMETRICAL SPLIT HERO & ORBITAL VISUALIZER           */}
      {/* ========================================================================= */}
      <section 
        ref={heroRef} 
        id="hero" 
        className="relative w-full min-h-[calc(100vh-5rem)] pt-24 pb-16 flex items-center justify-center overflow-visible"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (Headline + 84% Block) -> 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: cubicEase }}
              className="font-mono text-xs uppercase tracking-widest text-[#4F616B]"
            >
              [ 01 // AUTONOMOUS CREDIT OS ]
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#111E25] leading-[1.05]">
              Alternative Credit <br />
              for the Next <br />
              Billion.
            </h1>

            <motion.div
              custom={0.2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardPopVariants}
              className="bg-[#0E7490] text-white p-8 rounded-2xl shadow-sm max-w-xl"
            >
              <div className="text-6xl md:text-7xl font-bold font-mono tracking-tight text-white">
                84%
              </div>
              <div className="mt-2 text-xs md:text-sm font-mono tracking-widest text-[#ECFEFF] uppercase">
                Instant Underwriting for Unbanked Gig Workers
              </div>
            </motion.div>

            {/* Micro Footer Action Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#DDE5E5] max-w-xl">
              <button
                onClick={() => onLaunchConsole()}
                className="font-mono text-xs uppercase tracking-widest font-bold text-[#111E25] hover:text-[#0E7490] transition-colors flex items-center gap-2 cursor-pointer group"
              >
                <span>TEST IN CONSOLE</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              <span className="font-mono text-[11px] text-[#4F616B] uppercase">
                {backendOnline ? `FASTAPI 8000 (${backendLatency || 14}MS)` : "ENGINE READY (14MS)"} &bull; ZERO PII
              </span>
            </div>
          </div>

          {/* Right Column (Kinetic Orbital Card) -> 5 cols */}
          <div className="lg:col-span-5 flex justify-center">
            {/* Staged Entrance Spring Container */}
            <motion.div 
              custom={0.35}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardPopVariants}
              className="w-full flex justify-center"
            >
              {/* Nested container that retains your existing scroll transform */}
              <motion.div 
                style={{ scale: cardScale, opacity: cardOpacity }}
                className="w-full max-w-md bg-white border border-[#DDE5E5] rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(14,116,144,0.06)] flex flex-col items-center"
              >
                {/* Orb and Telemetry Controls */}
                <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#4F616B] uppercase mb-6">
                  <span>Telemetry Stream</span>
                  <span className="flex items-center gap-1.5 text-[#0E7490]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E7490] animate-ping" />
                    Active
                  </span>
                </div>

                {/* The Animated Sphere */}
                <div className="relative w-64 h-64 my-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#DDE5E5] animate-[spin_30s_linear_infinite]" />
                  <div 
                    className="w-48 h-48 rounded-full shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.4),0_0_40px_rgba(14,116,144,0.3)] flex flex-col items-center justify-center p-4 text-center"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #22D3EE 0%, #0E7490 55%, #083344 100%)'
                    }}
                  >
                    <span className="text-[10px] font-mono tracking-wider text-white/90">TELEMETRY STREAM: ACTIVE</span>
                    <div className="w-12 h-[1px] bg-white/30 my-2" />
                    <span className="text-[9px] font-mono tracking-widest text-cyan-200">UPI &bull; GST &bull; TELECOM</span>
                  </div>
                </div>

                <button 
                  onClick={() => onLaunchConsole()}
                  className="w-full mt-6 bg-[#0E7490] hover:bg-[#155E75] text-white py-3 rounded-full font-mono text-xs tracking-wider transition-colors duration-200 cursor-pointer"
                >
                  LAUNCH LIVE CONSOLE ↗
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FRAME 3: PAGE 02 — BORROWER ARCHETYPE DISC CAROUSEL                       */}
      {/* ========================================================================= */}
      <section
        id="personas"
        ref={personasRef}
        className="min-h-screen w-full bg-white flex flex-col justify-center border-t border-[#DDE5E5] relative py-24 overflow-hidden"
      >
        <motion.div
          style={{ scale: personaScale, opacity: personaOpacity }}
          className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-10"
        >
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#4F616B]">
              [ 02 // BORROWER ARCHETYPES ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111E25]">
              Underwritten for Every Invisible Hustle.
            </h2>
            <p className="text-sm text-[#4F616B] font-mono">
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
                      scale: isSelected ? 1.06 : 0.95,
                      opacity: isSelected ? 1 : 0.65,
                    }}
                    whileHover={{ scale: isSelected ? 1.06 : 1.02, opacity: 1 }}
                    transition={{ duration: 0.25, ease: cubicEase }}
                    className={`p-6 border transition-all cursor-pointer flex flex-col items-center text-center space-y-4 relative overflow-hidden rounded-2xl ${
                      isSelected
                        ? "bg-white border-2 border-[#0E7490] shadow-[0_20px_40px_rgba(14,116,144,0.15)] z-10"
                        : "bg-white border-[#DDE5E5] hover:border-[#4F616B]"
                    }`}
                  >
                    {/* Disc Number Tag */}
                    <span className="font-mono text-[10px] text-[#4F616B] uppercase tracking-widest font-bold">
                      DISC {disc.num}
                    </span>

                    {/* Circular Organic Disc with Rotating Aura Ring on Active */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {isSelected && (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#0E7490]"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-[#ECFEFF] blur-sm"
                          />
                        </>
                      )}

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
                      <h4 className="font-bold text-sm text-[#111E25] m-0">
                        {disc.shortTitle}
                      </h4>
                      <p className="text-[11px] text-[#4F616B] font-mono mt-0.5 m-0 truncate max-w-[150px]">
                        {disc.role}
                      </p>
                    </div>

                    {/* Disc Score Pill */}
                    <span
                      className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#ECFEFF] text-[#0E7490] border-[#0E7490]/30"
                    >
                      SCORE: {disc.metrics.score}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Inspection Panel: Selecting a disc animates telemetry details into side panel (x: 20 -> 0, opacity: 0 -> 1, duration: 0.35s) */}
            <div className="lg:col-span-5 min-h-[360px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDisc.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#F4F7F6] border border-[#DDE5E5] p-6 sm:p-8 space-y-5 shadow-sm rounded-2xl"
                >
                  <div className="flex items-center justify-between border-b border-[#DDE5E5] pb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#4F616B] tracking-wider block">
                        TELEMETRY PROFILE // {currentDisc.num}
                      </span>
                      <h3 className="text-lg font-bold text-[#111E25] m-0">
                        {currentDisc.name}
                      </h3>
                    </div>
                    <span
                      className="font-mono text-xs font-bold px-3 py-1 text-white rounded bg-[#0E7490]"
                    >
                      VERIFIED
                    </span>
                  </div>

                  {/* Quote */}
                  <p
                    className="text-xs text-[#4F616B] italic leading-relaxed m-0 border-l-2 pl-3 border-[#0E7490]"
                  >
                    &ldquo;{currentDisc.quote}&rdquo;
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-white p-3 border border-[#DDE5E5] rounded-lg">
                      <span className="text-[10px] text-[#4F616B] uppercase block">Monthly Cashflow</span>
                      <span className="font-bold text-[#111E25]">{currentDisc.metrics.turnover}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#DDE5E5] rounded-lg">
                      <span className="text-[10px] text-[#4F616B] uppercase block">Frequency</span>
                      <span className="font-bold text-[#111E25]">{currentDisc.metrics.txCount}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#DDE5E5] rounded-lg">
                      <span className="text-[10px] text-[#4F616B] uppercase block">Discipline Factor</span>
                      <span className="font-bold text-[#0E7490]">{currentDisc.metrics.regularity}</span>
                    </div>
                    <div className="bg-white p-3 border border-[#DDE5E5] rounded-lg">
                      <span className="text-[10px] text-[#4F616B] uppercase block">Underwritten Score</span>
                      <span className="font-bold text-[#111E25]">{currentDisc.metrics.score} / 900</span>
                    </div>
                  </div>

                  {/* CTA Routing: Clicking "Test this archetype in workbench >" updates active profile and switches view directly to console */}
                  <button
                    onClick={() => onLaunchConsole(currentDisc.preset)}
                    className="w-full py-3.5 bg-[#0E7490] hover:bg-[#155E75] text-white font-mono font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-sm group"
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
      {/* FRAME 4: PAGE 03 — THE DARK MONOLITH PIPELINE ACCORDION                   */}
      {/* ========================================================================= */}
      <section
        id="pipeline"
        ref={monolithRef}
        className="min-h-screen w-full bg-[#0A0A0C] text-white flex flex-col justify-center relative py-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: cubicEase }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6"
          >
            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#38BDF8] font-bold">
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

          {/* Interactive 4-Row Accordion (Hover or Click expands detail smoothly) */}
          <div className="divide-y divide-white/10">
            {accordionRows.map((row, idx) => {
              const isActive = activeAccordionRow === idx;

              return (
                <div
                  key={row.num}
                  onMouseEnter={() => setActiveAccordionRow(idx)}
                  onClick={() => setActiveAccordionRow(idx)}
                  className={`py-6 sm:py-7 transition-all cursor-pointer group px-4 -mx-4 ${
                    isActive ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Index + Title with active indicator bar in #0E7490 */}
                    <div className="flex items-center gap-6 md:w-1/3 relative">
                      {isActive && (
                        <motion.div
                          layoutId="activeAccordionBar"
                          className="absolute -left-4 top-1 bottom-1 w-1 bg-[#0E7490] rounded-r"
                        />
                      )}
                      <span
                        className={`font-mono text-sm sm:text-base font-bold transition-colors ${
                          isActive ? "text-[#38BDF8]" : "text-white/30 group-hover:text-white"
                        }`}
                      >
                        {row.num}.
                      </span>
                      <h3
                        className={`text-xl sm:text-3xl font-bold tracking-tight transition-colors m-0 ${
                          isActive ? "text-[#38BDF8]" : "text-white group-hover:text-[#38BDF8]"
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
                          isActive
                            ? "bg-[#0E7490] text-white border-[#0E7490]"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}
                      >
                        {row.badge}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Drawer (height: 0 -> auto smoothly) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: cubicEase }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pl-12 text-xs font-mono text-[#ECFEFF] leading-relaxed">
                          &bull; {row.detail}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FRAME 5: PAGE 04 — THE STEEL TEAL IMPACT MATRIX                           */}
      {/* ========================================================================= */}
      <section
        id="impact"
        ref={matrixRef}
        className="min-h-screen w-full bg-[#0E7490] text-white flex flex-col justify-center relative py-24"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: cubicEase }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/20 pb-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#ECFEFF] font-semibold block mb-1">
                [ 04 // BENCHMARKS &amp; PRECISION ]
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white m-0">
                AURA Delivers Mathematical Precision With Every Vector.
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#ECFEFF] uppercase">
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
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                4x
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Faster Decision Velocity
              </h3>
              <div className="font-mono text-xs text-[#ECFEFF] pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Traditional Bureau:</span>
                  <span className="line-through opacity-70">5–7 Days</span>
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
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                80%
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Reduction in Manual Bureau Rejections
              </h3>
              <div className="font-mono text-xs text-[#ECFEFF] pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Traditional Bureau:</span>
                  <span className="line-through opacity-70">Thin-File Rejection</span>
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
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                60%
              </div>
              <h3 className="text-base font-bold text-white m-0">
                Growth in Underwritten Loan Disbursals
              </h3>
              <div className="font-mono text-xs text-[#ECFEFF] pt-1 space-y-1">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>Deterministic Knockout:</span>
                  <span className="text-white">0 Capital Burn</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>Model Transparency:</span>
                  <span>100% TreeSHAP</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* White Action Pill Button */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/20">
            <div className="font-mono text-xs text-[#ECFEFF] uppercase">
              FCRA § 615 COMPLIANT &bull; RBI ACCOUNT AGGREGATOR CONSENT
            </div>

            <button
              onClick={() => onLaunchConsole()}
              className="bg-white text-[#0E7490] hover:bg-[#111E25] hover:text-white px-9 py-4 font-mono font-bold text-xs uppercase tracking-widest transition-all rounded-full shadow-lg cursor-pointer flex items-center gap-2 group"
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
