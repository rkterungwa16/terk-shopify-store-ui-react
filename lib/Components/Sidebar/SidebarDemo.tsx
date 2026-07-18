"use client";

import { JSX, useState } from "react";
import { Backdrop } from "./Backdrop";
import { DemoStage } from "./DemoContent";
import { useIsMobile } from "./hooks/useIsMobile";
import { useTooltip } from "./hooks/useToolTip";
import { AppTooltip } from "./Tooltip";
import { Theme } from "./types";
import "./style.css";
import { Sidebar } from "./Sidebar";

export default function SidebarDemo(): JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");
  const [expanded, setExpanded] = useState<boolean>(false);
  const tooltipApi = useTooltip();
  const isMobile = useIsMobile();

  const toggleTheme = (): void =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className={`app-root${theme === "dark" ? " dark" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar
        tooltipApi={tooltipApi}
        expanded={expanded}
        setExpanded={setExpanded}
        isMobile={isMobile}
      />
      <Backdrop
        visible={isMobile && expanded}
        onClick={() => setExpanded(false)}
      />
      <AppTooltip tooltip={tooltipApi.tooltip} />
      <DemoStage theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
