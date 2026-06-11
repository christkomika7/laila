export function NavButton({
  children,
  disabled,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-full border border-white/10 bg-black/20 text-foreground hover:bg-[hsl(var(--book-gold))]/20 hover:text-[hsl(var(--book-gold))] hover:border-[hsl(var(--book-gold))]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--book-gold))]"
      {...rest}
    >
      {children}
    </button>
  );
}
