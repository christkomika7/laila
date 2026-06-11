import { useRef } from "react";
import { Label } from "./label";
import { X, Upload } from "lucide-react";

export function FileField({
  label,
  accept,
  hint,
  required,
  value,
  onChange,
  onClear,
}: {
  label: string;
  accept: string;
  hint?: string;
  required?: boolean;
  value: File | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {value ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">
          <span className="truncate flex-1 text-muted-foreground">
            {value.name}
          </span>
          <button
            onClick={onClear}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-all"
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span>Choisir un fichier</span>
          {hint && <span className="ml-auto text-xs opacity-60">{hint}</span>}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
    </div>
  );
}
