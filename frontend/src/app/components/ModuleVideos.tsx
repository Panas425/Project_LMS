"use client";

import { IDocument } from "../utils";

interface ModuleVideosProps {
  videos: (IDocument & { fullUrl: string })[];
}

export function ModuleVideos({ videos }: ModuleVideosProps) {
  if (!videos.length) return null;
  return (
    <div className="module-videos mt-3">
      <h5>Videos:</h5>
      {videos.map(video => (
        <video key={video.id} width="100%" controls>
          <source src={video.fullUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ))}
    </div>
  );
}
