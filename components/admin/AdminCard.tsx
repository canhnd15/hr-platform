export function AdminCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-4 rounded-xl">
      <header className="px-6 py-4 border-b border-gray-4">
        <h2 className="text-base font-semibold text-dark-1">{title}</h2>
        {description && (
          <p className="text-sm text-gray-1 mt-1">{description}</p>
        )}
      </header>
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <footer className="px-6 py-4 border-t border-gray-4 bg-gray-5 rounded-b-xl flex items-center justify-end gap-3">
          {footer}
        </footer>
      )}
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="font-medium text-dark-1">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-2">{hint}</span>}
    </label>
  );
}

export function FlashBanner({
  message,
  kind = "success",
}: {
  message?: string;
  kind?: "success" | "error";
}) {
  if (!message) return null;
  const colors =
    kind === "success"
      ? "bg-positive-light text-positive border-positive/30"
      : "bg-[#fce9e9] text-[#d70000] border-[#d70000]/30";
  return (
    <p
      role={kind === "success" ? "status" : "alert"}
      className={`text-sm px-3 py-2 rounded-md border ${colors}`}
    >
      {message}
    </p>
  );
}

export const inputCls =
  "border border-gray-3 rounded-md h-11 px-3 text-sm focus:border-primary focus:outline-none bg-white text-dark-1";
export const textareaCls =
  "border border-gray-3 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white text-dark-1 leading-relaxed";
