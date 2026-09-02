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
        primary: "#0E7490", // Steel Teal Primary
        bg: "bg-steel-tint",
        border: "border-steel-primary/30",
        text: "text-steel-primary",
        glow: "shadow-sm",
        badge: "bg-steel-tint text-steel-primary border border-steel-primary/30",
        pillBg: "bg-steel-primary",
      };
    case "MANUAL_REVIEW":
      return {
        primary: "#D97706", // Warm Amber
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-800",
        glow: "shadow-sm",
        badge: "bg-amber-50 text-amber-900 border border-amber-300",
        pillBg: "bg-amber-600",
      };
    case "REJECTED":
    default:
      return {
        primary: "#E11D48", // Muted Rose / Brick
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-800",
        glow: "shadow-sm",
        badge: "bg-rose-50 text-rose-900 border border-rose-300",
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
