// src/components/modules/VideoModule.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { VideoModule as VideoModuleType } from '@/lib/types/moduleTypes';
import { cn } from '@/lib/utils';

interface VideoModuleProps {
  module: VideoModuleType;
  className?: string;
}

export default function VideoModule({ module, className }: VideoModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Extract video ID from URL for external videos
  const getVideoEmbedUrl = (url: string, type: string) => {
    if (type === 'youtube') {
      // Extract YouTube video ID
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      if (match && match[1]) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=${module.autoplay ? 1 : 0}&mute=${module.muted ? 1 : 0}&loop=${module.loop ? 1 : 0}&controls=${module.controls ? 1 : 0}`;
      }
    } else if (type === 'vimeo') {
      // Extract Vimeo video ID
      const regex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/;
      const match = url.match(regex);
      if (match && match[1]) {
        const videoId = match[1];
        return `https://player.vimeo.com/video/${videoId}?autoplay=${module.autoplay ? 1 : 0}&muted=${module.muted ? 1 : 0}&loop=${module.loop ? 1 : 0}&controls=${module.controls ? 1 : 0}`;
      }
    }
    return url; // Return original URL if no match
  };

  // Set up the local video player
  useEffect(() => {
    if (videoRef.current && module.video_type === 'local') {
      // Set video properties
      if (module.autoplay) videoRef.current.autoplay = true;
      if (module.muted) videoRef.current.muted = true;
      if (module.loop) videoRef.current.loop = true;
      if (!module.controls) videoRef.current.controls = false;
    }
  }, [module]);

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-6">{module.title}</h2>
          )}

          <div className="rounded-lg overflow-hidden">
            {module.video_type === 'local' ? (
              // Local video
              <video
                ref={videoRef}
                className="w-full h-auto"
                poster={module.poster_image}
                autoPlay={module.autoplay}
                muted={module.muted}
                loop={module.loop}
                controls={module.controls !== false}
                playsInline
              >
                <source src={module.video_url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              // YouTube/Vimeo video
              <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getVideoEmbedUrl(module.video_url, module.video_type || 'youtube')}
                  title={module.title || "Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen={module.allow_fullscreen !== false}
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}