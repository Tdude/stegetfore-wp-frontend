// src/components/modules/FeaturedPostsModule.tsx - Updated version
'use client';

import React, { useEffect, useState } from 'react';
import { FeaturedPostsModule as FeaturedPostsModuleType } from '@/lib/types/moduleTypes';
import { LocalPost, Post } from '@/lib/types/contentTypes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import NextImage from '@/components/NextImage';
import { cn } from '@/lib/utils';

// Define a WordPress post type that matches the structure received from the API
interface WordPressPost {
  id: number | string;
  slug?: string;
  link?: string;
  title: string | { rendered: string };
  excerpt?: string | { rendered: string };
  content?: string | { rendered: string };
  date?: string;
  categories?: string[];
  featured_image_url?: string;
  featured_image?: string;
  [key: string]: unknown;
}

interface FeaturedPostsModuleProps {
  module: FeaturedPostsModuleType;
  className?: string;
}

export default function FeaturedPostsModule({ module, className }: FeaturedPostsModuleProps) {
  // Add a useEffect to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default to 3 columns if not specified
  const columns = module.columns || 3;
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Get layout - use display_style from API response
  const layout = module.display_style || 'grid';
  const layoutClasses = {
    grid: columnClasses[columns as keyof typeof columnClasses],
    list: 'grid-cols-1 max-w-2xl mx-auto',
    carousel: 'flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x',
  };

  // Background color from module if available
  const bgColor = module.backgroundColor ? { backgroundColor: module.backgroundColor } : {};
  
  // Helper function to check if an object has a rendered property
  const isRenderedTitle = (title: unknown): title is { rendered: string } => {
    return title !== null && typeof title === 'object' && 'rendered' in title;
  };

  const title = typeof module.title === 'string' ? module.title :
      (isRenderedTitle(module.title) ? (module.title as { rendered: string }).rendered : 'Featured Posts');

  // Safely handle posts with proper typing
  const posts = Array.isArray(module.posts) 
    ? module.posts.map(post => post as WordPressPost) 
    : [];
    
  // Display a loading state until client-side hydration completes
  if (!isClient) {
    return (
      <section className={cn("py-12", className)} style={{ backgroundColor: module.backgroundColor || '' }}>
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">{title}</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // Handle case where posts haven't been loaded yet
  if (!module.posts || module.posts.length === 0) {
    return (
      <section className={cn("py-12 bg-muted/50", className)} style={bgColor}>
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">{module.title || 'Featured Posts'}</h2>
          {module.subtitle && (
            <p className="text-xl text-muted-foreground mb-8 max-w-[800px]">{module.subtitle}</p>
          )}
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
    <section className={cn("py-12", className)} style={bgColor}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          {module.title && (
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              {module.title}
            </h2>
          )}
          <div className="w-24 h-1 bg-primary mx-auto"></div>
          {module.subtitle && (
            <p className="text-xl text-muted-foreground my-4 text-center">{module.subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            layout === 'carousel'
              ? "flex overflow-x-auto gap-6 pb-4 snap-x"
              : `grid gap-6 ${layoutClasses[layout as keyof typeof layoutClasses] || layoutClasses.grid}`
          )}
        >
          {posts.map((post) => {
            // Helper functions for post data
            const hasFeaturedImage = (post: WordPressPost): boolean => {
              return Boolean(post.featured_image_url || post.featured_image);
            };

            const getFeaturedImageUrl = (post: WordPressPost): string | null => {
              return post.featured_image_url || post.featured_image || null;
            };

            const postTitle = typeof post.title === 'string'
              ? post.title
              : isRenderedTitle(post.title) ? post.title.rendered : '';

            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug || post.id}`}
                className={cn(
                  "block h-full",
                  layout === 'carousel' ? 'min-w-[300px] sm:min-w-[350px] snap-center' : ''
                )}
              >
                <Card className="h-full overflow-hidden">
                  {hasFeaturedImage(post) && (
                    <div className="aspect-video relative overflow-hidden">
                      <NextImage
                        src={getFeaturedImageUrl(post) || ''}
                        htmlTitle={postTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    {/* Handle categories as they appear in the API response */}
                    {module.show_categories !== false && post.categories && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.categories?.map((category: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <CardTitle className="text-xl line-clamp-2">
                      {postTitle}
                    </CardTitle>

                    {/* Show date if enabled */}
                    {module.show_date && post.date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    )}
                  </CardHeader>

                  {module.show_excerpt !== false && (
                    <CardContent>
                      {post.excerpt ? (
                        <div className="text-muted-foreground line-clamp-3">
                          {typeof post.excerpt === 'string'
                            ? post.excerpt
                            : isRenderedTitle(post.excerpt) ? post.excerpt.rendered : ''}
                        </div>
                      ) : (
                        <div className="text-muted-foreground line-clamp-3">
                          {post.content && typeof post.content === 'string'
                            ? post.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
                            : post.content && typeof post.content === 'object' && 'rendered' in post.content
                            ? post.content.rendered?.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
                            : ''}
                        </div>
                      )}
                    </CardContent>
                  )}

                  {module.show_button !== false && (
                    <CardFooter>
                      <Button variant="ghost" className="mt-2">
                        {module.button_text || 'Read More'} →
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Posts button */}
        {module.show_view_all && module.view_all_url && (
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link href={module.view_all_url}>
                {module.view_all_text || 'View All Posts'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}