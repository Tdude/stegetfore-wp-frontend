// src/app/blog/page.tsx
// Blog listing page with custom layout:
// - First card has full width (horizontal layout on larger screens)
// - Middle cards follow standard grid layout
// - Last two cards have special treatment (50/50 or full width for last card)
// This is the main blog listing component used at /blog route
import { Suspense } from 'react';
import { fetchPosts, fetchCategories } from '@/lib/api';
import { Post, Category } from '@/lib/types/contentTypes';
import { PostSkeleton } from '@/components/PostSkeleton';
import NextImage from '@/components/NextImage';
import Link from 'next/link';
import { Card, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DebugPanel from '@/components/debug/DebugPanel';

// Define interfaces for blog page types
interface CategoryDisplay {
  id: number;
  name: string;
  slug: string;
}

interface CategoriesMap {
  [key: number]: CategoryDisplay;
}

interface BlogPostsData {
  posts: Post[];
  categories: CategoriesMap;
}

// Fetch posts with categories
async function fetchPostsWithCategories(): Promise<BlogPostsData> {
  const [posts, categoriesData] = await Promise.all([
    fetchPosts(),
    fetchCategories()
  ]);

  return {
    posts,
    categories: categoriesData
  };
}

// Helper function to safely get array elements with fallbacks
function getSafePost(posts: Post[], index: number): Post | null {
  return posts && posts.length > index ? posts[index] : null;
}

// Helper function to render a consistent post card
function renderPostCard(post: Post | null, categories: CategoriesMap, variant: 'standard' | 'wide' | 'compact' = 'standard') {
  if (!post) return null;
  
  const isWide = variant === 'wide';
  const isCompact = variant === 'compact';
  const excerptLimit = isWide ? 300 : 150;
  
  const cardContent = (
    <>
      {/* Image */}
      {post.featured_image_url && (
        <div className={`relative ${isCompact ? 'aspect-[4/3]' : 'aspect-video'} ${isWide ? 'md:w-1/2 md:aspect-auto md:h-[350px]' : ''} overflow-hidden`}>
          <NextImage
            src={post.featured_image_url}
            htmlTitle={post.title?.rendered || ''}
            fill
            priority={isWide}
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      {/* Content */}
      <div className={`p-6 ${isWide ? 'md:w-1/2' : ''} flex flex-col h-full`}>
        <div className="flex-grow">
          {/* Categories */}
          {post.categories && categories && (
            <div className="flex flex-wrap gap-2 mb-2">
              {(post.categories || []).slice(0, 2).map((categoryId) => {
                const catId = typeof categoryId === 'number' ? categoryId : 
                  (typeof categoryId === 'object' && categoryId !== null && 'id' in categoryId) 
                    ? (categoryId as Category).id 
                    : 0;
                    
                return categories[catId] && (
                  <Badge key={`cat-${catId}`} variant="secondary">
                    {categories[catId]?.name || 'Category'}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {/* Title */}
          <CardTitle className={`${isCompact ? 'text-lg' : isWide ? 'text-2xl' : 'text-xl'} mb-4 line-clamp-2`}>
            <span dangerouslySetInnerHTML={{ __html: post.title?.rendered || '' }} />
          </CardTitle>
          
          {/* Excerpt */}
          {!isCompact && (
            <div 
              className={`text-muted-foreground ${isWide ? 'line-clamp-5' : 'line-clamp-3'} mb-4`}
              dangerouslySetInnerHTML={{ 
                __html: post.content?.rendered 
                  ? post.content.rendered.substring(0, excerptLimit) + 
                    (post.content.rendered.length > excerptLimit ? '...' : '') 
                  : '' 
              }}
            />
          )}
        </div>
        
        {/* Read more button */}
        <div className="mt-auto pt-4">
          <span className={cn(
            badgeVariants({ variant: "secondary" }),
            "inline-block"
          )}>
            Läs mer →
          </span>
        </div>
      </div>
    </>
  );
  
  return (
    <Card className="h-full overflow-hidden">
      <div className={isWide ? 'md:flex' : ''}>
        {cardContent}
      </div>
    </Card>
  );
}

// Main content component that handles data fetching
async function BlogContent() {
  const { posts, categories } = await fetchPostsWithCategories();
  const safetyPosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">I fokus</h1>

      {/* Blog posts with specific layout */}
      {safetyPosts.length > 0 && (
        <div className="space-y-8">
          {/* FIRST post - full width */}
          <div className="w-full">
            <Link href={`/posts/${safetyPosts[0]?.slug || '#'}`} className="block h-full">
              {renderPostCard(safetyPosts[0], categories, 'wide')}
            </Link>
          </div>

          {/* Middle posts - standard grid */}
          {safetyPosts.length > 3 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {safetyPosts.slice(1, safetyPosts.length - 2).map((post) => (
                <Link key={post.id} href={`/posts/${post.slug || '#'}`} className="block h-full">
                  {renderPostCard(post, categories, 'standard')}
                </Link>
              ))}
            </div>
          )}

          {/* LAST TWO posts - 50/50 or full width */}
          {safetyPosts.length > 1 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Second-to-last post */}
              {safetyPosts.length > 1 && (
                <Link 
                  href={`/posts/${getSafePost(safetyPosts, safetyPosts.length - 2)?.slug || '#'}`} 
                  className="block h-full"
                >
                  {renderPostCard(getSafePost(safetyPosts, safetyPosts.length - 2), categories, 'standard')}
                </Link>
              )}

              {/* Last post - either 50% or full width */}
              <Link 
                href={`/posts/${getSafePost(safetyPosts, safetyPosts.length - 1)?.slug || '#'}`} 
                className={`block h-full ${safetyPosts.length % 2 === 0 ? "" : "sm:col-span-2"}`}
              >
                {renderPostCard(
                  getSafePost(safetyPosts, safetyPosts.length - 1), 
                  categories, 
                  safetyPosts.length % 2 === 0 ? 'standard' : 'wide'
                )}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Show a message if no posts */}
      {safetyPosts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Inga inlägg hittades.</p>
        </div>
      )}

      {/* Debug panel at the bottom */}
      <div className="mt-12">
        <DebugPanel 
          title="Page Debug" 
          additionalData={{
            "Posts Count": safetyPosts?.length || 0,
            "Categories": categories ? Object.keys(categories).length : 0,
            "Page Type": "Blog Index"
          }}
        />
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <BlogContent />
    </Suspense>
  );
}

export async function generateMetadata() {
  return {
    title: 'Blog',
    description: 'Latest blog posts and articles',
  };
}