import { ChevronRight } from "lucide-react";
import { JSX } from "react";
import { BotData } from "./types";

interface BotButtonProps {
  bot: BotData;
  isActive: boolean;
  tabIndex: number;
  onClick: () => void;
}

export function SubItem({
  bot,
  isActive,
  tabIndex,
  onClick,
}: BotButtonProps): JSX.Element {
  const Icon = bot.icon;
  return (
    <button
      type="button"
      className={`sub-item${isActive ? " active" : ""}`}
      tabIndex={tabIndex}
      aria-current={isActive ? "true" : undefined}
      onClick={onClick}
    >
      <div
        className="bot-dot"
        style={{ background: bot.color }}
        aria-hidden="true"
      >
        <Icon size={12} color="#fff" fill="#fff" />
      </div>
      <span>{bot.label}</span>
    </button>
  );
}

export function FlyoutItem({
  bot,
  isActive,
  tabIndex,
  onClick,
}: BotButtonProps): JSX.Element {
  const Icon = bot.icon;
  return (
    <button
      type="button"
      className={`flyout-item${isActive ? " active" : ""}`}
      tabIndex={tabIndex}
      aria-current={isActive ? "true" : undefined}
      onClick={onClick}
    >
      <span className="flyout-label">{bot.label}</span>
      {bot.caretInFlyout ? (
        <span className="caret" aria-hidden="true">
          <ChevronRight size={14} strokeWidth={2} />
        </span>
      ) : (
        <div
          className="bot-dot"
          style={{ background: bot.color }}
          aria-hidden="true"
        >
          <Icon size={12} color="#fff" fill="#fff" />
        </div>
      )}
    </button>
  );
}
