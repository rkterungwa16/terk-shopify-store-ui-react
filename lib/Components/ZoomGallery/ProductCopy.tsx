import { colors } from "./types";

export function ProductCopy() {
  return (
    <header style={{ maxWidth: "46ch" }}>
      <p
        style={{
          fontFamily: "Courier New, ui-monospace, monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: colors.brass,
          margin: 0,
        }}
      >
        Optics — No. 0114
      </p>
      <h1
        style={{
          fontWeight: 500,
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          letterSpacing: "-0.01em",
          margin: "0.2em 0 0.1em",
        }}
      >
        Aperture 50mm&nbsp;f/1.4
      </h1>
      <p
        style={{
          fontFamily: "Courier New, ui-monospace, monospace",
          fontSize: "0.8rem",
          color: colors.paperDim,
          letterSpacing: "0.02em",
          margin: 0,
        }}
      >
        9 blades · manual focus · brass mount · 62mm filter thread
      </p>
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${colors.line}`,
          margin: "20px 0",
        }}
      />
      <p
        style={{ color: colors.paperDim, lineHeight: 1.6, fontSize: "0.95rem" }}
      >
        A standard prime built the old way: hand-fitted brass helicoid, a
        9-blade iris for round out-of-focus light, and glass ground to stay
        honest at the edges. Click any panel — or the aperture mark on the main
        image — to open the loupe view.
      </p>
    </header>
  );
}
