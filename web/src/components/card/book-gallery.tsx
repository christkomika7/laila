import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import BookPage from "./book";
import { apiServerClient } from "#/lib/api";
import { NavButton } from "../ui/nav-button";
import type { State } from "#/types/gallery";
import { reducer } from "#/lib/helpers";
import { DesktopBook } from "./desktop-book";

const initialState: State = {
  items: [],
  status: "loading",
  currentIndex: 0,
  direction: 0,
  isMobile: false,
};

const BookGallery = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, status, currentIndex, direction, isMobile } = state;

  const [isFlipping, setIsFlipping] = useState(false);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const check = () =>
      dispatch({ type: "SET_MOBILE", value: window.innerWidth < 1024 });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const res = await apiServerClient.fetch("/gallery");
        if (!res.ok) throw new Error();
        const data = await res.json();
        dispatch({
          type: "FETCH_SUCCESS",
          payload: Array.isArray(data) ? data : [],
        });
      } catch {
        dispatch({ type: "FETCH_ERROR" });
      }
    };
    fetchGallery();
  }, []);

  const itemsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  const scrollToTop = () => {
    const el = document.getElementById("book-gallery-top");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 100,
        behavior: "smooth",
      });
  };

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (isFlipping) return;
      if (pageIndex < 0 || pageIndex >= totalPages) return;
      dispatch({
        type: "NAVIGATE",
        index: pageIndex * itemsPerPage,
        direction: pageIndex > currentPage ? 1 : -1,
      });
      scrollToTop();
    },
    [isFlipping, totalPages, itemsPerPage, currentPage],
  );

  const handlePrev = useCallback(
    () => goToPage(currentPage - 1),
    [goToPage, currentPage],
  );
  const handleNext = useCallback(
    () => goToPage(currentPage + 1),
    [goToPage, currentPage],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dist = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) > 50) dist > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[hsl(var(--book-gold))] animate-spin" />
        <p className="text-muted-foreground font-display italic">
          Ouverture des archives…
        </p>
      </div>
    );
  }

  if (status === "error" || items.length === 0) {
    return (
      <div className="text-center py-32 bg-[hsl(var(--book-bg))] rounded-3xl border border-white/5">
        <p className="text-xl text-muted-foreground font-display">
          {status === "error"
            ? "Impossible de charger la galerie."
            : "La galerie est vide pour l'instant."}
        </p>
      </div>
    );
  }

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  const leftItem = items[currentIndex];
  const rightItem = items[currentIndex + 1];

  return (
    <div
      id="book-gallery-top"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Page {currentPage + 1} / {totalPages}
        </span>
        <div className="flex gap-3">
          <NavButton
            onClick={handlePrev}
            disabled={!canPrev || isFlipping}
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </NavButton>
          <NavButton
            onClick={handleNext}
            disabled={!canNext || isFlipping}
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </NavButton>
        </div>
      </div>

      <div
        className="relative w-full mx-auto select-none"
        style={{
          aspectRatio: isMobile ? "3/4" : "2/1.15",
          perspective: "2000px",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {isMobile ? (
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="wait"
            onExitComplete={() => setIsFlipping(false)}
          >
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
              onAnimationStart={() => setIsFlipping(true)}
              onAnimationComplete={() => setIsFlipping(false)}
              className="absolute inset-0 w-full h-full p-2"
              style={{ transformStyle: "preserve-3d" }}
            >
              <BookPage
                item={leftItem}
                pageNumber={currentIndex + 1}
                isLeft
                preload
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <DesktopBook
            key="desktop-book"
            items={items}
            currentIndex={currentIndex}
            direction={direction}
            leftItem={leftItem}
            rightItem={rightItem}
            onFlipStart={() => setIsFlipping(true)}
            onFlipEnd={() => setIsFlipping(false)}
          />
        )}
      </div>
      <div
        className="flex justify-center gap-2 mt-10"
        role="tablist"
        aria-label="Pages"
      >
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={idx === currentPage}
            aria-label={`Aller à la page ${idx + 1}`}
            onClick={() => goToPage(idx)}
            className={[
              "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--book-gold))]",
              idx === currentPage
                ? "w-8 bg-[hsl(var(--book-gold))]"
                : "w-2 bg-white/20 hover:bg-white/50",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
};

export default BookGallery;
