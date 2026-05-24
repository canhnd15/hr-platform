"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type ToastKind = "success" | "error" | "info";
export type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{
  toast: (message: string, kind?: ToastKind) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() outside <ToastProvider>");
  return ctx.toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none"
      >
        {items.map((t) => (
          <ToastItem
            key={t.id}
            item={t}
            onClose={() =>
              setItems((prev) => prev.filter((x) => x.id !== t.id))
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onClose }: { item: Toast; onClose: () => void }) {
  const colors =
    item.kind === "success"
      ? "bg-positive text-white"
      : item.kind === "error"
        ? "bg-[#d70000] text-white"
        : "bg-dark-1 text-white";
  return (
    <div
      role="status"
      className={`pointer-events-auto min-w-[260px] max-w-sm rounded-lg shadow-modal px-4 py-3 text-sm font-medium flex items-start gap-3 ${colors} animate-in slide-in-from-right`}
      style={{ animation: "toastIn .2s ease-out" }}
    >
      <span className="flex-1">{item.message}</span>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
