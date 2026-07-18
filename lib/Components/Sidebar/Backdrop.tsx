import { JSX } from "react";

interface BackdropProps {
  visible: boolean;
  onClick: () => void;
}

export function Backdrop({ visible, onClick }: BackdropProps): JSX.Element {
  return (
    <div
      className={`backdrop${visible ? " show" : ""}`}
      aria-hidden="true"
      onClick={onClick}
    />
  );
}
