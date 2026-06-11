import type { BookPageProps } from "#/types/gallery";
import BookMediaLoader from "../loader/book-media-loader";

const pageBase =
  "flex flex-col h-full bg-[hsl(var(--book-page-bg))] border border-white/5 shadow-2xl relative overflow-hidden";
const leftPage = "rounded-l-2xl border-r-black/40";
const rightPage = "rounded-r-2xl border-l-black/40";

const BookPage = ({ item, pageNumber, isLeft, preload }: BookPageProps) => {
  const side = isLeft ? leftPage : rightPage;
  if (!item) {
    return (
      <div className={`${pageBase} ${side} p-8 sm:p-12`}>
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-px bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageBase} ${side} group`}>
      <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-black/40 pointer-events-none z-20 mix-blend-overlay" />

      <div className="flex-1 flex flex-col p-6 sm:p-10 z-10 h-full">
        <div className="mb-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 tracking-wide">
            {item.title}
          </h3>
          <div className="w-12 h-px bg-[hsl(var(--book-gold))]/50 mx-auto" />
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/50 mb-6 min-h-[300px]">
          <BookMediaLoader
            src={item.imageUrl ?? null}
            type={item.mediaType === "VIDEO" ? "video" : "image"}
            alt={item.title}
            preload={preload}
            className="absolute inset-0"
          />
        </div>

        {item.description && (
          <div className="mt-auto text-center px-4">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light italic">
              {item.description}
            </p>
          </div>
        )}
        <div
          className={`absolute bottom-4 ${isLeft ? "left-6" : "right-6"} text-xs font-medium text-muted-foreground/50 tracking-widest`}
        >
          {pageNumber}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
