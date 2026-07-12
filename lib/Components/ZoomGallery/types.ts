export const colors = {
  ink: "#17130f",
  inkRaised: "#201b15",
  paper: "#efe7da",
  paperDim: "#b8ac97",
  brass: "#b8763e",
  brassBright: "#d99457",
  safelight: "#9c3428",
  line: "rgba(239, 231, 218, 0.12)",
} as const;

export const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

export interface Panel {
  id: string;
  label: string;
  tint: string;
}

export interface ZoomState {
  panels: Panel[];
  activeIndex: number;
  isOpen: boolean;
  originX: number;
  originY: number;
  highRes: boolean[];
  [key: string]: number | Panel[] | boolean | boolean[];
}

export interface ChangePayload<K extends keyof ZoomState> {
  key: K;
  value: ZoomState[K];
  prev: ZoomState[K] | undefined;
}

export type Listener<K extends keyof ZoomState> = (
  payload: ChangePayload<K>,
) => void;

export interface Origin {
  x: number;
  y: number;
}
