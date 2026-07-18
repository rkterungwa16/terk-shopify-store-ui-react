import { JSX } from "react";
import { TooltipState } from "./types";

export function AppTooltip({ tooltip }: { tooltip: TooltipState }): JSX.Element {
  return (
    <div
      className={`tooltip${tooltip.visible ? " show" : ""}`}
      style={{ left: tooltip.x, top: tooltip.y }}
      aria-hidden="true"
    >
      {tooltip.text}
    </div>
  );
}
