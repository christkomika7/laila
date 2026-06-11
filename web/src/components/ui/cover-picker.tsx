import { useRef } from "react";
import { Label } from "./label";
import { Plus, X } from "lucide-react";

export function CoverPicker({
  preview,
  onFile,
  onClear,
}: {
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label>
        Pochette{" "}
        <span className="text-muted-foreground font-normal">(optionnel)</span>
      </Label>
      {preview ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClear}
            className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">Image</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
