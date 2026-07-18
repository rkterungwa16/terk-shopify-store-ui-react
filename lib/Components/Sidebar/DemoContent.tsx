import { JSX } from "react";
import { Theme } from "./types";

interface DemoStageProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function DemoStage({ theme, onToggleTheme }: DemoStageProps): JSX.Element {
  return (
    <div className="stage" id="main-content" tabIndex={-1}>
      <h1>React Sidebar</h1>
      <p>
        Collapse the rail with the arrow at the bottom. While collapsed, click the robot icon to open
        the flyout submenu &mdash; the same pattern from the reference designs, rebuilt with typed hooks.
      </p>
      <button className="theme-toggle" aria-pressed={theme === "dark"} onClick={onToggleTheme}>
        🌗 Toggle theme
      </button>
      <span className="hint">Click any nav item to set it active &middot; click &ldquo;Chat bots&rdquo; to expand its submenu</span>
    </div>
  );
}
