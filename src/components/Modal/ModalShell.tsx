import { useRef } from "react";
import type { ReactNode } from "react";
import { useModalA11y } from "../../hooks/useModalA11y";

interface ModalShellProps {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
  role?: "dialog" | "alertdialog";
  className?: string;
}

/**
 * Accessible modal wrapper: Esc to close, focus trap, scroll lock, and focus
 * returns to the button that opened it. Clicking the dark backdrop closes it.
 */
export default function ModalShell({
  children,
  onClose,
  labelledBy,
  role = "dialog",
  className = "w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl",
}: ModalShellProps) {
  const ref = useRef<HTMLElement | null>(null);
  useModalA11y(ref, onClose);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={className}
      >
        {children}
      </section>
    </div>
  );
}
