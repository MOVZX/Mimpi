import { useToast, type ToastType } from "@/context/ToastContext";

const iconMap: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const colorMap: Record<ToastType, string> = {
  success:
    "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300",
  error:
    "bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300",
  info: "bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in ${colorMap[toast.type]}`}
        >
          <span className="text-sm font-bold mt-0.5 shrink-0">
            {iconMap[toast.type]}
          </span>
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current/60 hover:text-current shrink-0 mt-0.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
