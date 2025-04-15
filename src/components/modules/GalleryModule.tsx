// src/components/modules/GalleryModule.tsx
'use client';

import React, { useState } from 'react';
import { GalleryModule as GalleryModuleType } from '@/lib/types/moduleTypes';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface GalleryModuleProps {
  module: GalleryModuleType;
  className?: string;
}

export default function GalleryModule({ module, className }: GalleryModuleProps) {
  const [openImage, setOpenImage] = useState<number | null>(null);

  // Get column count classes for grid layout
  const getGridColumns = () => {
    switch (module.columns) {
      case 2:
        return 'md:grid-cols-2';
      case 3:
        return 'md:grid-cols-3';
      case 4:
        return 'md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'md:grid-cols-3';
    }
  };

  // Handle image click if lightbox is enabled
  const handleImageClick = (index: number) => {
    if (module.enable_lightbox) {
      setOpenImage(index);
    }
  };

  // Render carousel layout
  if (module.layout === 'carousel') {
    return (
      <section className={cn("py-16 bg-muted/30", className)}>
        <div className="container px-4 md:px-6">
          {module.title && (
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              {module.title}
            </h2>
          )}

          <Carousel className="w-full">
            <CarouselContent>
              {module.items.map((item, index) => (
                <CarouselItem key={item.id || index}>
                  <Dialog open={openImage === index} onOpenChange={(open) => !open && setOpenImage(null)}>
                    <DialogTrigger asChild>
                      <div
                        className="cursor-pointer overflow-hidden rounded-md"
                        onClick={() => handleImageClick(index)}
                      >
                        <AspectRatio ratio={16/9} className="relative">
                          <Image
                            src={item.image}
                            alt={item.title || `Gallery image ${index + 1}`}
                            fill={true}
                            sizes="100vw"
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </AspectRatio>
                        {item.title && (
                          <div className="mt-2 text-sm font-medium">{item.title}</div>
                        )}
                      </div>
                    </DialogTrigger>
                    {module.enable_lightbox && (
                      <DialogContent className="sm:max-w-3xl">
                        <div>
                          <div className="relative w-full h-64 md:h-96">
                            <Image
                              src={item.image}
                              alt={item.title || `Gallery image ${index + 1}`}
                              fill={true}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1024px"
                              className="object-contain rounded-md"
                            />
                          </div>
                          {item.title && (
                            <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                          )}
                          {item.description && (
                            <p className="text-muted-foreground mt-2">{item.description}</p>
                          )}
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>
    );
  }

  // Render masonry layout
  if (module.layout === 'masonry') {
    return (
      <section className={cn("py-16 bg-muted/30", className)}>
        <div className="container px-4 md:px-6">
          {module.title && (
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              {module.title}
            </h2>
          )}

          <div className={`columns-1 ${getGridColumns().replace('grid-cols', 'columns')} gap-4`}>
            {module.items.map((item, index) => (
              <Dialog
                key={item.id || index}
                open={openImage === index}
                onOpenChange={(open) => !open && setOpenImage(null)}
              >
                <DialogTrigger asChild>
                  <div
                    className="cursor-pointer break-inside-avoid mb-4 overflow-hidden rounded-md"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={item.image}
                      alt={item.title || `Gallery image ${index + 1}`}
                      width={600}
                      height={400}
                      className="w-full h-auto transition-transform hover:scale-105"
                    />
                    {item.title && (
                      <div className="p-2 text-sm font-medium">{item.title}</div>
                    )}
                  </div>
                </DialogTrigger>
                {module.enable_lightbox && (
                  <DialogContent className="sm:max-w-3xl">
                    <div>
                      <div className="relative w-full h-64 md:h-96">
                        <Image
                          src={item.image}
                          alt={item.title || `Gallery image ${index + 1}`}
                          fill={true}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1024px"
                          className="object-contain rounded-md"
                        />
                      </div>
                      {item.title && (
                        <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                      )}
                      {item.description && (
                        <p className="text-muted-foreground mt-2">{item.description}</p>
                      )}
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default to grid layout
  return (
    <section className={cn("py-16 bg-muted/30", className)}>
      <div className="container px-4 md:px-6">
        {module.title && (
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            {module.title}
          </h2>
        )}

        <div className={`grid grid-cols-1 ${getGridColumns()} gap-4`}>
          {module.items.map((item, index) => (
            <Dialog
              key={item.id || index}
              open={openImage === index}
              onOpenChange={(open) => !open && setOpenImage(null)}
            >
              <DialogTrigger asChild>
                <div
                  className="cursor-pointer overflow-hidden rounded-md"
                  onClick={() => handleImageClick(index)}
                >
                  <AspectRatio ratio={1/1} className="relative">
                    <Image
                      src={item.image}
                      alt={item.title || `Gallery image ${index + 1}`}
                      fill={true}
                      sizes={`(max-width: 768px) 100vw, (max-width: 1024px) ${100/module.columns!}vw, ${100/module.columns!}vw`}
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </AspectRatio>
                  {item.title && (
                    <div className="mt-2 text-sm font-medium">{item.title}</div>
                  )}
                </div>
              </DialogTrigger>
              {module.enable_lightbox && (
                <DialogContent className="sm:max-w-3xl">
                  <div>
                    <div className="relative w-full h-64 md:h-96">
                      <Image
                        src={item.image}
                        alt={item.title || `Gallery image ${index + 1}`}
                        fill={true}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1024px"
                        className="object-contain rounded-md"
                      />
                    </div>
                    {item.title && (
                      <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                    )}
                    {item.description && (
                      <p className="text-muted-foreground mt-2">{item.description}</p>
                    )}
                  </div>
                </DialogContent>
              )}
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}