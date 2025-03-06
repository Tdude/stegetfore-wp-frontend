// src/components/modules/FeaturedPostsModule.tsx
'use client';

import React from 'react';
import { FeaturedPostsModule as FeaturedPostsModuleType } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

interface FeaturedPostsModuleProps {
  module: FeaturedPostsModuleType;
  className?: string;
}

export default function FeaturedPostsModule({ module, className }: FeaturedPostsModuleProps) {
  // Get columns count
  const columns = module.columns || 3;
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Get layout
  const layoutClasses = {
    grid: columnClasses[columns as keyof typeof columnClasses],
    list: 'grid-cols-1 max-w-2xl mx-auto',
    carousel: 'flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x',
  };

  const layout = module.display_style || 'grid';

  // Handle case where posts haven't been loaded yet
  if (!module.posts || module.posts.length === 0) {
    return (
      <section className={cn("py-12 bg-muted/50", className)}>
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">{module.title || 'Featured Posts'}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader className="pb-2">
                  <div className="h-6 w-24 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-12 bg-muted/50", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        {module.title && (
          <h2 className="text-3xl font-bold tracking-tighter mb-8">{module.title}</h2>
        )}

        <div
          className={cn(
            layout === 'carousel'
              ? "flex overflow-x-auto gap-6 pb-4 snap-x"
              : `grid gap-6 ${layoutClasses[layout]}`
          )}
        >
          {module.posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className={cn(
                "block h-full",
                layout === 'carousel' ? 'min-w-[300px] sm:min-w-[350px] snap-center' : ''
              )}
            >
              <Card className="h-full overflow-hidden">
                {post.featured_image_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <OptimizedImage
                      src={post.featured_image_url}
                      htmlTitle={post.title.rendered}
                      alt={post.title?.rendered ?
                        post.title.rendered.replace(/<[^>]*>/g, '') :
                        'Featured post'}
                      fill={true}
                      containerType="card"
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  {module.show_categories !== false && post.categories && module.categories && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.categories.slice(0, 2).map((categoryId) => (
                        module.categories[categoryId] && (
                          <Badge key={categoryId} variant="secondary">
                            {module.categories[categoryId].name}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                  <CardTitle className="text-xl line-clamp-2">
                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  </CardTitle>
                </CardHeader>
                {module.show_excerpt !== false && (
                  <CardContent>
                    {post.excerpt?.rendered ? (
                      <div
                        className="text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                    ) : (
                      <div
                        className="text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                      />
                    )}
                  </CardContent>
                )}
                {module.show_read_more !== false && (
                  <CardFooter>
                    <div className="text-sm text-primary hover:underline">
                      Read more →
                    </div>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}