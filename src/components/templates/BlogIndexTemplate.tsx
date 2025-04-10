// src/components/templates/BlogIndexTemplate.tsx
'use client';

import React from 'react';
import { Page } from '@/lib/types/contentTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';
import DebugPanel from '@/components/debug/DebugPanel';
import Link from 'next/link';

// Blog index template for displaying posts with pagination
export default function BlogIndexTemplate({ page, posts, categories }: { page: Page, posts?: any[], categories?: any }) {
  // Featured image for the blog index page
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
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
        
        {/* Blog posts listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map(post => (
              <article key={post.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post._embedded['wp:featuredmedia'][0].source_url}
                      alt={post.title?.rendered || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      <span dangerouslySetInnerHTML={{ __html: post.title?.rendered || '' }}></span>
                    </Link>
                  </h2>
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  {post.excerpt?.rendered && (
                    <div 
                      className="text-gray-700 text-sm mb-4" 
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    ></div>
                  )}
                  <Link 
                    href={`/posts/${post.slug}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No posts found.</p>
            </div>
          )}
        </div>
        
        {/* Pagination placeholder - to be implemented */}
        <div className="flex justify-center mt-12">
          {/* Pagination controls will go here */}
        </div>
        
        {/* Debug panel at the bottom */}
        <DebugPanel 
          title="Page Debug" 
          page={page}
          additionalData={{
            "Posts Count": Array.isArray(posts) ? posts.length : 0,
            "Categories": categories ? Object.keys(categories).length : 0
          }}
        />
      </div>
    </TemplateTransitionWrapper>
  );
}
