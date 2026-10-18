import { FiAlertCircle } from "react-icons/fi";

interface FieldErrorProps {
  message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mt-2 flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-gradient-to-r from-red-50 to-rose-50 px-3.5 py-3 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

      <p className="text-[12px] font-medium leading-5">{message}</p>
    </div>
  );
}
