// src/components/tryggve/TryggveSellingCards.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface SellingCard {
  image: string;
  title: string;
  description: string;
}

interface TryggveSellingCardsProps {
  title?: string;
  description?: string;
  cards: SellingCard[];
  className?: string;
}

export default function TryggveSellingCards({ 
  title,
  description,
  cards, 
  className 
}: TryggveSellingCardsProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
      <div className="container mx-auto px-4 md:px-6">
        {(title || description) && (
          <div className="max-w-4xl mx-auto text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-black">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg md:text-xl text-gray-800">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-custom border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold font-heading mb-3 text-black">
                  {card.title}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
