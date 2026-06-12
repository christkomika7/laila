export function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
