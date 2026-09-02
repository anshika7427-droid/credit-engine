# AURA Underwriting Intelligence Platform (UI)

Production-grade enterprise fintech dashboard for alternative credit scoring, non-traditional borrower evaluation, and SHAP decision explainability.

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

---

## Key Architecture & Features

1. **High-Conversion Enterprise Landing Page (`src/views/LandingPage.tsx`)**:
   - **Fintech Hero Section**: Radial gradient background with subtle ambient glows, product tagline ("Credit Intelligence for the Next Billion Borrowers"), and clear CTAs.
   - **Animated Live Metric Counters**: `<150ms` Decision Latency, `82%+` Gini Discrimination, `100%` FCRA/RBI Explainable.
   - **Interactive Scoring Teaser**: Live sandbox to preview score shifts across archetype personas before entering the full workbench.
   - **Three Pillar Value Props**: Cards with hover glow and scale micro-interactions covering Alternative Digital Footprint, TreeSHAP Local Attribution, and Deterministic Guardrails.

2. **Streamlined Underwriting Console (`src/views/UnderwritingConsole.tsx`)**:
   - **Horizontal Segmented Pill Presets**: Compact selector for 🟢 Prime Gig Worker (Ravi K.), 🔵 Solid Kirana Merchant (Gupta Stores), 🟡 Borderline Freelancer (Ananya S.), and 🔴 Delinquency Knockout (Vikas M.).
   - **Changed-Field Pulse Highlight**: Clicking any preset auto-fills inputs and triggers a subtle pulse highlight on modified telemetry fields.
   - **Clean 2-Column Balanced Split**:
     - **Left Column (Telemetry Form - 45% width)**: 3 collapsible accordion cards (Persona & Core Inflows, UPI & Cashflow Dynamics, Discipline & Regularity) + sticky high-contrast action bar with `Ctrl + Enter` shortcut.
     - **Right Column (Decision Engine - 55% width)**: Animated radial SVG score gauge with framer-motion count-up animation, non-intrusive Knockout rule banner/modal, and dynamic approval badges.
   - **Explainability & Attribution Tabs**:
     - **Tab 1: Visual SHAP Drivers**: Horizontal diverging bar chart showing exact positive impact (+pts) vs negative risk drag (-pts).
     - **Tab 2: Adverse Action Notice**: Formal regulatory statement letter compliant with FCRA § 615 and RBI Digital Lending Guidelines.
     - **Tab 3: Audit JSON**: Syntax-highlighted immutable audit trail with one-click copy.

3. **Motion, Animation & Polish**:
   - Framer Motion page cross-fades, accordion spring animations, and card hover scaling (`scale: 1.01`).
   - Radial SVG score count-up interpolation on new predictions.
   - Celebratory light confetti (`canvas-confetti`) when an application achieves `APPROVED` with a score $\ge 780$.
   - Global keyboard shortcut: `Ctrl + Enter` (or `Cmd + Enter`) to evaluate.

---

## API Communication

The dashboard communicates with the local FastAPI scoring backend:

```http
POST http://127.0.0.1:8000/api/v1/score
Content-Type: application/json
```

### Request Payload (`BorrowerProfile`)
```json
{
  "borrower_type": "gig_worker",
  "monthly_inflow": 35000.0,
  "upi_tx_count_monthly": 45,
  "upi_debit_to_credit_ratio": 0.82,
  "cashflow_volatility": 0.25,
  "utility_payment_delay_days": 3,
  "telecom_recharge_regularity": 0.95,
  "gst_filing_punctuality": 0.0,
  "ecommerce_cancellation_rate": 0.05
}
```

### Response Model (`CreditScoreResponse`)
```json
{
  "application_id": "95f87b8d-...",
  "status": "APPROVED",
  "credit_score": 872,
  "risk_tier": "PRIME",
  "default_probability": 0.0466,
  "knockout_reason": null,
  "top_positive_factors": [
    "Strong signal: cashflow_volatility",
    "Strong signal: telecom_recharge_regularity"
  ],
  "adverse_action_reasons": [
    "Risk factor: gst_filing_punctuality",
    "Risk factor: upi_tx_count_monthly",
    "Risk factor: utility_payment_delay_days"
  ]
}
```

---

## Development & Execution

```bash
# Navigate to ui directory
cd ui

# Install dependencies (already installed)
npm install

# Start Vite Development Server
npm run dev

# Build for Production
npm run build
```
