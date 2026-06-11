import { Eye, EyeOff, Music2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import type { Track } from "#/types/album";

export function TrackRow({
  track,
  onEdit,
  onPublish,
  onDelete,
}: {
  track: Track;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  const mins = Math.floor(track.duration);
  const secs = Math.round((track.duration - mins) * 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/20 transition-colors">
      <div className="w-9 h-9 rounded-md overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music2 className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground">
          {mins}:{secs} · {track.price} FCFA
          {track.featuringArtists.length > 0 &&
            ` · ft. ${track.featuringArtists.join(", ")}`}
        </p>
      </div>
      <Badge
        variant={track.published ? "default" : "secondary"}
        className="text-xs shrink-0"
      >
        {track.published ? "Publié" : "Brouillon"}
      </Badge>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onPublish}
        >
          {track.published ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
