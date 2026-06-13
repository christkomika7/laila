import type { LucideProps } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card rounded-md p-5 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center ${accent ? "bg-amber-500/10" : "bg-muted"}`}
        >
          <Icon
            className={`w-4 h-4 ${accent ? "text-amber-400" : "text-muted-foreground"}`}
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={`text-3xl font-bold font-mono ${accent ? "text-amber-400" : "text-foreground"}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
