import { Pencil, Trash2, Play } from "lucide-react";
import { Badge } from "../ui/badge";
import type { GalleryItem } from "#/types/gallery";

export default function GalleryCard({
  item,
  onEdit,
  onDelete,
}: {
  item: GalleryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isVideo = item.mediaType === "VIDEO";

  return (
    <div className="group relative rounded-lg overflow-hidden border border-border bg-muted aspect-3/4">
      {isVideo ? (
        <>
          <video
            src={item.imageUrl}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              (e.target as HTMLVideoElement).currentTime = 0.1;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-200">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-200 flex flex-col justify-between p-2 z-20">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant="secondary" className="text-xs">
            #{item.pageOrder}
          </Badge>
          {isVideo && (
            <Badge
              variant="outline"
              className="text-xs border-white/30 text-white bg-black/40"
            >
              Vidéo
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs font-medium truncate flex-1 mr-2 drop-shadow">
            {item.title}
          </p>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
