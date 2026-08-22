import { cn } from "../../lib/cn";

export function ViewToggle({
  view,
  onChange,
}: {
  view: "list" | "board";
  onChange: (view: "list" | "board") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
      {(["list", "board"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
            view === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
