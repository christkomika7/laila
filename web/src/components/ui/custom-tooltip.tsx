import { formatCurrency } from "#/lib/utils";

export function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md p-3 shadow-xl text-sm">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name} :{" "}
          <span className="font-semibold font-mono">
            {p.dataKey === "revenue" ? formatCurrency(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
