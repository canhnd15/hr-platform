import type { ApplicationStage } from "@/lib/application-stages";

export function StageBadge({
  stage,
  size = "sm",
}: {
  stage: ApplicationStage;
  size?: "sm" | "md";
}) {
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${padding}`}
      style={{
        backgroundColor: `${stage.color}1a`, // ~10% opacity
        color: stage.color,
        border: `1px solid ${stage.color}33`,
      }}
    >
      {stage.label}
    </span>
  );
}
