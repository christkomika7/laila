import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CountryDropdown<
  T extends { code: string; name: string; flag: string; currency?: string },
>({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Sélectionner…",
  showCurrency = false,
}: {
  options: T[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showCurrency?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.code === value);
  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-4 flex items-center justify-between gap-2 rounded-md border border-neutral-700 bg-neutral-900 text-white text-sm hover:border-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              <span className="text-base leading-none shrink-0">
                {selected.flag}
              </span>
              <span className="text-neutral-100 truncate">{selected.name}</span>
              {showCurrency && selected.currency && (
                <span className="text-xs text-neutral-500 font-mono shrink-0">
                  {selected.currency}
                </span>
              )}
            </>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none border border-transparent focus:border-neutral-600"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-500 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-500 text-sm py-5">
                  Aucun résultat
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.code}
                    type="button"
                    onClick={() => {
                      onChange(o.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-neutral-800 transition-colors text-left ${value === o.code ? "bg-neutral-800" : ""}`}
                  >
                    <span className="text-base leading-none">{o.flag}</span>
                    <span
                      className={
                        value === o.code
                          ? "text-white font-medium"
                          : "text-neutral-300"
                      }
                    >
                      {o.name}
                    </span>
                    {showCurrency && o.currency && (
                      <span className="ml-auto text-xs font-mono text-neutral-600">
                        {o.currency}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
