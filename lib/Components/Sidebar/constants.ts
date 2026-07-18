import {
  Home,
  BarChart3,
  Bot,
  Calendar,
  Gem,
  Settings,
  MessageSquare,
  Circle,
  Box,
  Sparkles,
} from "lucide-react";
import { BotData, NavItemData } from "./types";

export const NAV_ITEMS: NavItemData[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "bots", label: "Chat bots", icon: Bot },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "nfts", label: "NFTs", icon: Gem },
  { id: "settings", label: "Settings", icon: Settings, dividerBefore: true },
];

export const BOTS: BotData[] = [
  { id: "gpt", label: "ChatGPT-4", icon: MessageSquare, color: "#4f6bed" },
  { id: "poe", label: "Poe", icon: Circle, color: "#8b5cf6" },
  { id: "openbot", label: "OpenBot", icon: Box, color: "#17a673", caretInFlyout: true },
  { id: "luminar", label: "LuminarAI", icon: Sparkles, color: "#f0654f" },
];

export const MOBILE_BREAKPOINT = 768;
