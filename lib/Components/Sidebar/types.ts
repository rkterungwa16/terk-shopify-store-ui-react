import {
  type LucideIcon,
} from "lucide-react";

export type Theme = "light" | "dark";

export interface NavItemData {
  id: string;
  label: string;
  icon: LucideIcon;
  dividerBefore?: boolean;
}

export interface BotData {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  /** OpenBot shows a ">" caret instead of its dot in the flyout, matching the reference design. */
  caretInFlyout?: boolean;
}

export interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

export interface UseTooltipReturn {
  tooltip: TooltipState;
  show: (el: HTMLElement, text: string) => void;
  hide: () => void;
}
