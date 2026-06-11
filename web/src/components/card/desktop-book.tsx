import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DesktopBookProps } from "#/types/gallery";
import BookPage from "./book";

export function DesktopBook({
  items,
  currentIndex,
  direction,
  leftItem,
  rightItem,
  onFlipStart,
  onFlipEnd,
}: DesktopBookProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const prevLeftItem = leftItem;
  const prevRightItem = rightItem;
  const prevIndexRef = useRef(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current === currentIndex) return;
    prevIndexRef.current = currentIndex;
    setIsAnimating(true);
    onFlipStart();
  }, [currentIndex]);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    onFlipEnd();
  };

  const flapOrigin = direction > 0 ? "left center" : "right center";
  const flapInitialRotation = direction > 0 ? 0 : 0;
  const flapExitRotation = direction > 0 ? -180 : 180;

  return (
    <div
      className="absolute inset-0 w-full h-full flex"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-0 bottom-0 w-6 -ml-3 z-40 pointer-events-none"
      />

      <div className="absolute inset-0 w-full h-full flex z-0">
        <div className="w-1/2 h-full">
          <BookPage
            item={items[currentIndex]}
            pageNumber={currentIndex + 1}
            isLeft
            preload
          />
        </div>
        <div className="w-1/2 h-full">
          <BookPage
            item={items[currentIndex + 1]}
            pageNumber={currentIndex + 2}
            isLeft={false}
            preload
          />
        </div>
      </div>

      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 w-full h-full flex z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.02, delay: 0.5 }}
          >
            <div className="w-1/2 h-full">
              <BookPage
                item={prevLeftItem}
                pageNumber={currentIndex + 1}
                isLeft
                preload
              />
            </div>
            <div className="w-1/2 h-full">
              <BookPage
                item={prevRightItem}
                pageNumber={currentIndex + 2}
                isLeft={false}
                preload
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className={`absolute top-0 bottom-0 z-20 ${direction > 0 ? "right-0 left-1/2" : "left-0 right-1/2"}`}
            style={{
              transformOrigin: flapOrigin,
              transformStyle: "preserve-3d",
              width: "50%",
            }}
            initial={{ rotateY: flapInitialRotation }}
            animate={{ rotateY: flapExitRotation }}
            transition={{
              duration: 0.7,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            onAnimationComplete={handleAnimationComplete}
          >
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
              {direction > 0 ? (
                <BookPage
                  item={prevRightItem}
                  pageNumber={currentIndex + 2}
                  isLeft={false}
                  preload
                />
              ) : (
                <BookPage
                  item={prevLeftItem}
                  pageNumber={currentIndex + 1}
                  isLeft
                  preload
                />
              )}
            </div>
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {direction > 0 ? (
                <BookPage
                  item={items[currentIndex]}
                  pageNumber={currentIndex + 1}
                  isLeft
                  preload
                />
              ) : (
                <BookPage
                  item={items[currentIndex + 1]}
                  pageNumber={currentIndex + 2}
                  isLeft={false}
                  preload
                />
              )}
            </div>
            <motion.div
              className="absolute inset-0 pointer-events-none z-30"
              style={{ backfaceVisibility: "hidden" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <div className="absolute inset-0" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
