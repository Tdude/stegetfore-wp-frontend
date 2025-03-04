// src/components/homepage/GallerySection.tsx
import React from 'react';
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

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  description?: string;
}

interface GallerySectionProps {
  items: GalleryItem[];
  title?: string;
}

export default function GallerySection({
  items,
  title = "Our Gallery"
}: GallerySectionProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        {title && (
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            {title}
          </h2>
        )}

        {/* Mobile: Carousel view */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem key={item.id}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer overflow-hidden rounded-md">
                        <AspectRatio ratio={16/9} className="relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill={true}
                            sizes="100vw"
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </AspectRatio>
                        <div className="mt-2 text-sm font-medium">{item.title}</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <div>
                        <div className="relative w-full h-64 md:h-96">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1024px"
                            className="object-contain rounded-md"
                          />
                        </div>
                        <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                        {item.description && (
                          <p className="text-muted-foreground mt-2">{item.description}</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Desktop: Grid view */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div className="cursor-pointer overflow-hidden rounded-md">
                  <AspectRatio ratio={1/1} className="relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill={true}
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="mt-2 text-sm font-medium">{item.title}</div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <div>
                  <div className="relative w-full h-64 md:h-96">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill={true}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1024px"
                      className="object-contain rounded-md"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                  {item.description && (
                    <p className="text-muted-foreground mt-2">{item.description}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}