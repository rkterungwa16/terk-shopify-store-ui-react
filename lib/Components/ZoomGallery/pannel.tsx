/* ============================================================================
 * PRODUCT DATA — stand-ins for real photography, zero external requests
 * ========================================================================== */

import { colors, Panel } from "./types";

export const PANELS: Panel[] = [
  { id: "front-element", label: "Front element", tint: "#3a4a52" },
  { id: "aperture-ring", label: "Aperture ring", tint: "#4a3a2a" },
  { id: "mount", label: "Brass mount", tint: "#5a4020" },
  { id: "hood", label: "Lens hood", tint: "#2f2b26" },
  { id: "case", label: "Case", tint: "#3a2f2a" },
];

export function PanelArt({
  panel,
  detailed = false,
}: {
  panel: Panel;
  detailed?: boolean;
}) {
  const blades = 9;
  const bladeElements = Array.from({ length: blades }, (_, i) => {
    const angle = (i / blades) * Math.PI * 2;
    const x = 50 + Math.cos(angle) * (detailed ? 26 : 22);
    const y = 50 + Math.sin(angle) * (detailed ? 26 : 22);
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={detailed ? 30 : 26}
        fill="none"
        stroke={colors.brass}
        strokeOpacity={0.55}
        strokeWidth={0.6}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={panel.label}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect width={100} height={100} fill={panel.tint} />
      <circle
        cx={50}
        cy={50}
        r={detailed ? 34 : 30}
        fill="#100d0a"
        stroke={colors.brassBright}
        strokeWidth={0.8}
      />
      {bladeElements}
      <circle cx={50} cy={50} r={6} fill="#0a0806" />
    </svg>
  );
}

export function ZoomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      style={{ width: 20, height: 20 }}
    >
      <circle cx={11} cy={11} r={7} />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      <path d="M11 8v6M8 11h6" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      style={{ width: 16, height: 16 }}
    >
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}
