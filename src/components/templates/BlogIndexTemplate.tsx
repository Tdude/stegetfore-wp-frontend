// src/components/templates/BlogIndexTemplate.tsx
// NOTE: This component is still used by the PageTemplateSelector for pages with the "templates/blog-index.php" template.
// It should not be confused with the main blog listing at /blog which is handled by /src/app/blog/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Page, Post } from '@/lib/types/contentTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';
import DebugPanel from '@/components/debug/DebugPanel';
import Link from 'next/link';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Postcard from '@/components/Postcard';
import { fetchBlogSettings } from '@/lib/api/postApi';

// Blog settings type
interface BlogSettings {
  layoutStyle: 'traditional' | 'magazine';
  postsPerPage: number;
  showAuthor: boolean;
  showDate: boolean;
  showExcerpt: boolean;
}

// Blog index template for displaying posts with pagination
export default function BlogIndexTemplate({ page, posts, categories }: { page: Page, posts?: any[], categories?: any }) {
  // Apply defensive coding to handle potentially missing data
  const safetyPosts = Array.isArray(posts) ? posts : [];
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  // State for blog settings with default value - we'll use traditional initially to match server rendering
  const [blogSettings, setBlogSettings] = useState<BlogSettings>({
    layoutStyle: 'traditional', // Default to traditional to match server rendering
    postsPerPage: 10,
    showAuthor: true,
    showDate: true,
    showExcerpt: true
  });
  
  // Loading state to prevent hydration errors
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch blog settings from the API
  useEffect(() => {
    let isMounted = true;
    
    async function loadBlogSettings() {
      try {
        const settings = await fetchBlogSettings();
        if (isMounted) {
          console.log('Blog settings loaded:', settings); // Add logging to debug
          setBlogSettings(settings);
          setIsLoading(false); // Mark loading as complete
        }
      } catch (error) {
        console.error('Error loading blog settings:', error);
        if (isMounted) {
          setIsLoading(false); // Mark loading as complete even on error
        }
      }
    }
    
    loadBlogSettings();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Determine if we're using magazine layout - only after loading is complete
  const isMagazineLayout = !isLoading && blogSettings.layoutStyle === 'magazine';
  
  // During initial render, always use traditional layout to match server rendering
  return (
    <TemplateTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Blog header */}
        <header className="mb-12">
          {featuredImage && (
            <div className="relative w-full h-64 md:h-80 mb-8 overflow-hidden rounded-lg">
              <Image
                src={featuredImage}
                alt={page.title?.rendered || 'Blog'}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: page.title?.rendered || 'Blog' }}></h1>
          {page.content?.rendered && (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content.rendered }}></div>
          )}
        </header>
        
        {/* Featured posts section - uses magazine layout if enabled (but only after client-side hydration) */}
        {safetyPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
            
            {/* Only use magazine layout after client-side hydration is complete */}
            {!isLoading && isMagazineLayout && safetyPosts.length >= 3 ? (
              // Magazine Layout with grid that ensures equal heights
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:grid-rows-[minmax(0,_1fr)] lg:auto-rows-fr">
                {/* Main featured post - takes 2/3 width but same height as others */}
                <div className="lg:col-span-2 lg:row-span-1 h-full flex">
                  <Postcard post={safetyPosts[0]} variant="featured" className="w-full" />
                </div>
                
                {/* Secondary posts column - two cards, each same height as the featured post */}
                <div className="lg:col-span-1 lg:row-span-1 grid grid-rows-2 gap-6 h-full">
                  <div className="row-span-1 h-full">
                    <Postcard key={`compact-${safetyPosts[1]?.id}`} post={safetyPosts[1]} variant="compact" className="h-full" />
                  </div>
                  <div className="row-span-1 h-full">
                    <Postcard key={`compact-${safetyPosts[2]?.id}`} post={safetyPosts[2]} variant="compact" className="h-full" />
                  </div>
                </div>
              </div>
            ) : (
              // Traditional Grid Layout (equal sized cards) - used for server rendering and as fallback
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {safetyPosts.slice(0, 3).map((post: Post) => (
                  <Postcard key={post.id} post={post} variant="default" className="h-full" />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Latest posts grid - respects layout setting */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
          
          {safetyPosts.length > 0 && (
            <>
              {!isLoading && isMagazineLayout && safetyPosts.length >= 3 ? (
                // Magazine Layout with grid that ensures equal heights
                <div className="space-y-8">
                  {/* First row - magazine layout with equal heights */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:grid-rows-[minmax(0,_1fr)] lg:auto-rows-fr">
                    {/* Main featured post - takes 2/3 width but same height as others */}
                    <div className="lg:col-span-2 lg:row-span-1 h-full flex">
                      <Postcard post={safetyPosts[0]} variant="featured" className="w-full" />
                    </div>
                    
                    {/* Secondary posts column - two cards, each same height as the featured post */}
                    <div className="lg:col-span-1 lg:row-span-1 grid grid-rows-2 gap-6 h-full">
                      <div className="row-span-1 h-full">
                        <Postcard key={`compact-${safetyPosts[1]?.id}`} post={safetyPosts[1]} variant="compact" className="h-full" />
                      </div>
                      <div className="row-span-1 h-full">
                        <Postcard key={`compact-${safetyPosts[2]?.id}`} post={safetyPosts[2]} variant="compact" className="h-full" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Remaining posts in a regular grid */}
                  {safetyPosts.length > 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                      {safetyPosts.slice(3).map((post: Post) => (
                        <Postcard key={post.id} post={post} variant="default" className="h-full" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Traditional Grid Layout - used for server rendering and as fallback
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {safetyPosts.map((post: Post) => (
                    <Postcard key={post.id} post={post} variant="default" className="h-full" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Categories section */}
        {categories && Object.keys(categories).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categories).map(([id, category]: [string, any]) => (
                <Link
                  key={id}
                  href={`/posts/category/${category.slug}`}
                  className={cn(
                    badgeVariants({ variant: "outline" }),
                    "hover:bg-blue-50 transition-colors"
                  )}
                >
                  {category.name} ({category.count || 0})
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Pagination controls */}
        <div className="flex justify-center mt-12">
          {/* Pagination implementation will go here */}
        </div>
        
        {/* Debug panel - now with improved data display */}
        <DebugPanel 
          title="Blog Index Debug" 
          page={{
            id: page.id,
            title: page.title?.rendered || '',
            content: page.content?.rendered || '',
            slug: page.slug,
            template: page.template || '',
            featured_image_url: page.featured_image_url || undefined,
            _embedded: page._embedded,
            // Cast modules to any to avoid type errors between Module and ModuleData
            modules: page.modules as any,
            show_content_with_modules: page.show_content_with_modules,
            meta: page.meta
          }}
          additionalData={{
            "Posts Count": safetyPosts.length,
            "Featured Post": safetyPosts.length > 0 ? safetyPosts[0].id : 'None',
            "Compact Posts": safetyPosts.length > 1 ? safetyPosts.slice(1, 3).length : 0,
            "Standard Posts": safetyPosts.length > 3 ? safetyPosts.slice(3).length : 0,
            "Categories": categories ? Object.keys(categories).length : 0,
            "Path": `/posts`,
            "Date": page.date || 'Unknown',
            "Raw Page Data": {
              id: page.id,
              slug: page.slug,
              title: page.title,
              date: page.date
            }
          }}
        />
      </div>
    </TemplateTransitionWrapper>
  );
}
