import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewPlayerProps {
  trackId: string;
  previewUrl: string | null;
  trackTitle: string;
  duration: number;
  currentPlayingTrackId: string | null;
  onPlayStart: (trackId: string) => void;
  onDurationChange?: (duration: number) => void;
}

const PreviewPlayer = ({
  trackId,
  previewUrl,
  trackTitle,
  duration,
  currentPlayingTrackId,
  onPlayStart,
  onDurationChange,
}: PreviewPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number): string => {
    if (!time || isNaN(time) || !isFinite(time)) return "--:--";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (currentPlayingTrackId !== trackId && isPlaying) {
      pauseAudio();
    }
  }, [currentPlayingTrackId, trackId, isPlaying, pauseAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    };
  }, []);

  useEffect(() => {
    if (!previewUrl || !audioRef.current) return;
    const audio = audioRef.current;

    const handleMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration);
        onDurationChange?.(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", handleMetadata);
    if (isFinite(audio.duration) && audio.duration > 0) {
      setAudioDuration(audio.duration);
      onDurationChange?.(audio.duration);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
    };
  }, [previewUrl, onDurationChange]);

  const playAudio = () => {
    if (!audioRef.current) return;
    setIsLoading(true);
    setError(false);

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          onPlayStart(trackId);
        })
        .catch((e: Error) => {
          console.error("Audio playback error:", e);
          if (e.name !== "AbortError") setError(true);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    if (!previewUrl) return;
    if (isPlaying) pauseAudio();
    else playAudio();
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime ?? 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const resolvedDuration = audioDuration ?? duration;
  const displayTime =
    isPlaying && currentTime > 0 ? currentTime : resolvedDuration;

  return (
    <div className="flex items-center gap-3">
      {previewUrl && (
        <audio
          ref={audioRef}
          src={previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      <motion.button
        whileHover={previewUrl && !error ? { scale: 1.05 } : {}}
        whileTap={previewUrl && !error ? { scale: 0.95 } : {}}
        onClick={togglePlay}
        disabled={!previewUrl || error}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 ${
          !previewUrl
            ? "bg-muted/10 text-muted-foreground/30 cursor-not-allowed border border-white/5"
            : error
              ? "bg-destructive/20 text-destructive border border-destructive/30"
              : isPlaying
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-primary"
                : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
        }`}
        aria-label={isPlaying ? `Pause ${trackTitle}` : `Play ${trackTitle}`}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <AlertCircle className="w-4 h-4" />
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : isPlaying ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Pause className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Play className="w-4 h-4 ml-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="text-xs font-medium text-red-100/50 w-10 text-center font-mono tabular-nums tracking-wide">
        {formatTime(displayTime)}
      </div>
    </div>
  );
};

export default PreviewPlayer;
