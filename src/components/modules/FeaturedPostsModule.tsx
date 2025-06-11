// src/components/modules/FeaturedPostsModule.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { FeaturedPostsModule as FeaturedPostsModuleType } from '@/lib/types/moduleTypes';
import { badgeVariants } from "@/components/ui/badge";
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
  
  // Check if we should use the magazine layout (from API)
  const useMagazineLayout = module.layout_style === 'magazine';
  
  const layoutClasses = {
    grid: useMagazineLayout ? 'grid-cols-1' : columnClasses[columns as keyof typeof columnClasses],
    list: 'grid-cols-1 max-w-2xl mx-auto',
    carousel: 'flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x',
  };

  // Fixed width for carousel cards to maintain consistency regardless of content
  const carouselItemWidth = layout === 'carousel' ? 'min-w-[300px] md:min-w-[350px]' : '';

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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 h-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-full flex">
                <div key={i} className="h-full rounded-lg bg-white overflow-hidden flex flex-col">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="flex flex-col flex-1">
                    <div className="pb-2">
                      <div className="h-6 w-24 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex-grow">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="pt-4">
                        <span className={cn(
                          badgeVariants({ variant: "secondary" }),
                          "inline-block"
                        )}>
                          Läs mer →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 h-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-full flex">
                <div key={i} className="h-full rounded-lg bg-white overflow-hidden flex flex-col">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="flex flex-col flex-1">
                    <div className="pb-2">
                      <div className="h-6 w-24 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex-grow">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="pt-4">
                        <span className={cn(
                          badgeVariants({ variant: "secondary" }),
                          "inline-block"
                        )}>
                          Läs mer →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          className={useMagazineLayout 
            ? "grid grid-cols-1 md:grid-cols-3 gap-6" 
            : cn("grid gap-6", layoutClasses[layout as keyof typeof layoutClasses] || layoutClasses.grid)
          }
        >
          {useMagazineLayout ? (
            <>
              {/* First card takes 2/3 width (col-span-2) */}
              {posts.length > 0 && (
                <div className="md:col-span-2 h-full">
                  <Link
                    href={`/posts/${posts[0].slug || posts[0].id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-lg shadow-sm h-[420px] flex flex-col overflow-hidden">
                      {(posts[0].featured_image_url || posts[0].featured_image) && (
                        <div className="aspect-[16/9] relative overflow-hidden">
                          <NextImage
                            src={(posts[0].featured_image_url || posts[0].featured_image) || ''}
                            htmlTitle={
                              typeof posts[0].title === 'string'
                                ? posts[0].title
                                : isRenderedTitle(posts[0].title) ? posts[0].title.rendered : ''
                            }
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-grow max-h-[300px] overflow-hidden">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2 line-clamp-1">
                            {typeof posts[0].title === 'string'
                              ? posts[0].title
                              : isRenderedTitle(posts[0].title) ? posts[0].title.rendered : ''}
                          </h3>

                          {/* Show date if enabled */}
                          {module.show_date && posts[0].date && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(posts[0].date).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex-grow">
                          {posts[0].excerpt ? (
                            <div className="text-muted-foreground line-clamp-2">
                              {typeof posts[0].excerpt === 'string'
                                ? posts[0].excerpt
                                : isRenderedTitle(posts[0].excerpt) ? posts[0].excerpt.rendered : ''}
                            </div>
                          ) : (
                            <div className="text-muted-foreground line-clamp-2">
                              {posts[0].content && typeof posts[0].content === 'string'
                                ? posts[0].content.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
                                : posts[0].content && typeof posts[0].content === 'object' && 'rendered' in posts[0].content
                                ? posts[0].content.rendered?.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
                                : ''}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto pt-2">
                          <span className={cn(
                            badgeVariants({ variant: "secondary" }),
                            "inline-block"
                          )}>
                            {module.button_text || 'Läs mer'} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              
              {/* Remaining two cards stack vertically in the last 1/3 space */}
              <div className="md:col-span-1 h-full grid grid-cols-1 gap-6">
                {posts.length > 1 && (
                  <Link
                    href={`/posts/${posts[1].slug || posts[1].id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
                      {(posts[1].featured_image_url || posts[1].featured_image) && (
                        <div className="aspect-video relative overflow-hidden">
                          <NextImage
                            src={(posts[1].featured_image_url || posts[1].featured_image) || ''}
                            htmlTitle={
                              typeof posts[1].title === 'string'
                                ? posts[1].title
                                : isRenderedTitle(posts[1].title) ? posts[1].title.rendered : ''
                            }
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-grow max-h-[200px] overflow-hidden">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {typeof posts[1].title === 'string'
                            ? posts[1].title
                            : isRenderedTitle(posts[1].title) ? posts[1].title.rendered : ''}
                        </h3>
                        
                        <div className="mt-auto pt-2">
                          <span className={cn(
                            badgeVariants({ variant: "secondary" }),
                            "inline-block"
                          )}>
                            {module.button_text || 'Läs mer'} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                
                {posts.length > 2 && (
                  <Link
                    href={`/posts/${posts[2].slug || posts[2].id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-lg shadow-sm h-[420px] flex flex-col overflow-hidden">
                      {(posts[2].featured_image_url || posts[2].featured_image) && (
                        <div className="aspect-video relative overflow-hidden">
                          <NextImage
                            src={(posts[2].featured_image_url || posts[2].featured_image) || ''}
                            htmlTitle={
                              typeof posts[2].title === 'string'
                                ? posts[2].title
                                : isRenderedTitle(posts[2].title) ? posts[2].title.rendered : ''
                            }
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-grow max-h-[200px] overflow-hidden">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {typeof posts[2].title === 'string'
                            ? posts[2].title
                            : isRenderedTitle(posts[2].title) ? posts[2].title.rendered : ''}
                        </h3>
                        
                        <div className="mt-auto pt-2">
                          <span className={cn(
                            badgeVariants({ variant: "secondary" }),
                            "inline-block"
                          )}>
                            {module.button_text || 'Läs mer'} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </>
          ) : (
            // Traditional grid layout
            posts.map((post) => {
              // Helper functions for post data
              const postTitle = typeof post.title === 'string'
                ? post.title
                : isRenderedTitle(post.title) ? post.title.rendered : '';

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug || post.id}`}
                  className={cn("block h-full", carouselItemWidth)}
                >
                  <div className="bg-white rounded-lg shadow-sm h-[420px] flex flex-col overflow-hidden">
                    {(post.featured_image_url || post.featured_image) && (
                      <div className="aspect-video relative overflow-hidden">
                        <NextImage
                          src={(post.featured_image_url || post.featured_image) || ''}
                          htmlTitle={postTitle}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow max-h-[200px] overflow-hidden">
                      <div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {postTitle}
                        </h3>

                        {module.show_date && post.date && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {new Date(post.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex-grow">
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
                      </div>

                      <div className="mt-auto pt-4">
                        <span className={cn(
                          badgeVariants({ variant: "secondary" }),
                          "inline-block"
                        )}>
                          {module.button_text || 'Läs mer'} →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* View All Posts button */}
        {module.show_view_all && module.view_all_url && (
          <div className="flex justify-center mt-8">
            <Link href={module.view_all_url} className={cn(
              badgeVariants({ variant: "secondary" }),
              "inline-block"
            )}>
              {module.view_all_text || 'Visa alla inlägg'} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}