export type StatusType = "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
export type RiskTierType = "PRIME" | "NEAR_PRIME" | "SUBPRIME" | "HIGH_RISK";

export interface RiskPalette {
  primary: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  badge: string;
  pillBg: string;
}

export function getStatusTheme(status: StatusType): RiskPalette {
  switch (status) {
    case "APPROVED":
      return {
        primary: "#0029FF", // Electric International Klein Blue
        bg: "bg-blue-50/50",
        border: "border-[#0029FF]/40",
        text: "text-[#0029FF]",
        glow: "shadow-sm",
        badge: "bg-[#0029FF] text-white border border-[#0029FF]",
        pillBg: "bg-[#0029FF]",
      };
    case "MANUAL_REVIEW":
      return {
        primary: "#D97706", // Warm Amber
        bg: "bg-amber-50/50",
        border: "border-amber-300",
        text: "text-amber-800",
        glow: "shadow-sm",
        badge: "bg-amber-100 text-amber-900 border border-amber-300",
        pillBg: "bg-amber-600",
      };
    case "REJECTED":
    default:
      return {
        primary: "#E11D48", // Muted Crimson / Brick
        bg: "bg-rose-50/50",
        border: "border-rose-300",
        text: "text-rose-800",
        glow: "shadow-sm",
        badge: "bg-rose-100 text-rose-900 border border-rose-300",
        pillBg: "bg-rose-600",
      };
  }
}

export function getRiskTierTheme(tier: RiskTierType | undefined): RiskPalette {
  switch (tier) {
    case "PRIME":
      return getStatusTheme("APPROVED");
    case "NEAR_PRIME":
      return getStatusTheme("MANUAL_REVIEW");
    case "SUBPRIME":
    case "HIGH_RISK":
    default:
      return getStatusTheme("REJECTED");
  }
}
