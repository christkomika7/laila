import { useState } from "react";
import FlipCard from "./flip-card";

interface CardData {
  id: string;
  title: string;
  frontVideo?: string;
  backImage?: string;
}

const FAKE_CARDS: CardData[] = [
  {
    id: "1",
    title: "Neon Nights",
    frontVideo:
      "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4",
    backImage:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80",
  },
  {
    id: "2",
    title: "Ocean Drift",
    frontVideo:
      "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4",
    backImage:
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80",
  },
  {
    id: "3",
    title: "City Pulse",
    frontVideo:
      "https://videos.pexels.com/video-files/2795405/2795405-uhd_2560_1440_30fps.mp4",
    backImage:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
  },
];

const FlipCardGrid = () => {
  // Swap `FAKE_CARDS` for real PocketBase data later
  const [cards] = useState<CardData[]>(FAKE_CARDS);

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map((card) => (
        <FlipCard
          key={card.id}
          title={card.title}
          frontVideo={card.frontVideo}
          backImage={card.backImage}
        />
      ))}
    </div>
  );
};

export default FlipCardGrid;
