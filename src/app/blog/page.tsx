// src/app/blog/page.tsx
// Blog listing page with custom layout:
// - First card has full width (horizontal layout on larger screens)
// - Middle cards follow standard grid layout
// - Last two cards have special treatment (50/50 or full width for last card)
// This is the main blog listing component used at /blog route
import { Suspense } from 'react';
import { fetchCategories } from '@/lib/api';
import { fetchPaginatedPostsWP } from '@/lib/api/postApi';
import { Post, Category } from '@/lib/types/contentTypes';
import NextImage from '@/components/NextImage';
import Link from 'next/link';
import { Card, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DebugPanel from '@/components/debug/DebugPanel';
import { calculateReadingTime } from '@/lib/utils/readingTime';
import { buildBlogDebugData } from '@/lib/debug/buildBlogDebugData';
import { decode } from 'he'; // Import the decode function

// Helper function to render a consistent post card
// Inline type for CategoryDisplay to avoid import and fix lint
function renderPostCard(post: Post | null, categories: { [key: number]: { id: number; name: string; slug: string } }, variant: 'standard' | 'wide' | 'compact' = 'standard') {
  if (!post) return null;
  
  const isWide = variant === 'wide';
  const isCompact = variant === 'compact';
  const excerptLimit = isWide ? 300 : 150;

  // Reading time based on content length
  const readingTime =
    post.content?.rendered ? `${calculateReadingTime(post.content.rendered)} min läsning` : null;

  const cardContent = (
    <>
      {/* Image */}
      {post.featured_image_url && (
        <div className={`relative ${isCompact ? 'aspect-[4/3]' : 'aspect-video'} ${isWide ? 'md:w-1/2 md:aspect-auto md:h-[350px]' : ''} overflow-hidden`}>
          <NextImage
            key={post.id + ':' + post.featured_image_url}
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

          {/* Categories with reading time badge for test */}
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
                    {/* Add reading time to the first badge for test */}
                    {readingTime && (
                      <span className="ml-2 text-xs text-secondary">{readingTime}</span>
                    )}
                  </Badge>
                );
              })}
            </div>
          )}
          
          {/* Title */}
          <CardTitle className="post-title mb-4 line-clamp-2">
            <span dangerouslySetInnerHTML={{ __html: post.title?.rendered || '' }} />
          </CardTitle>
          
          {/* Excerpt - Render as plain text to avoid hydration issues */}
          {!isCompact && (() => {
            if (!post?.content?.rendered) return null;
            try {
              // Strip HTML tags using RegExp constructor for robustness
              const htmlTagRegex = new RegExp('<\\/?[^>]+(>|$)', 'g');
              const text = post.content.rendered.replace(htmlTagRegex, '');
              // Decode HTML entities
              const decodedText = decode(text);
              // Truncate plain text
              const truncatedText = decodedText.substring(0, excerptLimit) + (decodedText.length > excerptLimit ? '...' : '');
              return (
                <div className={`text-secondary ${isWide ? 'line-clamp-5' : 'line-clamp-3'} mb-4`}>
                  {truncatedText} 
                </div>
              );
            } catch (error) {
              console.error('Error processing excerpt text:', error);
              return null; // Don't render excerpt if error
            }
          })()}
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
    <Card className={cn(
      "h-full overflow-hidden",
      isWide ? 'md:flex' : ''
    )}>
      {cardContent}
    </Card>
  );
}

// Main content component that handles data fetching
async function BlogContent({ page }: { page: number }) {
  const POSTS_PER_PAGE = 12;
  // Use paginated fetch with _embed for images
  const { posts, total } = await fetchPaginatedPostsWP(page, POSTS_PER_PAGE);
  // Fetch categories as before
  const categories = await fetchCategories();

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const pagePosts = posts;
  
  // Convert Post[] to BlogPost[] format for debug panel
  const debugPosts = posts.map(post => ({
    id: post.id,
    title: post.title?.rendered,
    slug: post.slug,
    content: post.content?.rendered,
    featured_image_url: post.featured_image_url,
  }));
  
  const debugData = buildBlogDebugData(debugPosts, Object.values(categories));

  // Split posts for layout logic
  const firstPost = pagePosts[0];
  // Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
  const GRID_COLS = 3; // You can make this dynamic if you want
  let middlePosts: Post[] = [];
  let lastPosts: Post[] = [];

  // Calculate how many posts should be in the last row (1 or 2)
  const postsAfterFirst = pagePosts.slice(1);
  let lastRowCount = 0;
  if (postsAfterFirst.length % GRID_COLS === 1) {
    lastRowCount = 1;
  } else if (postsAfterFirst.length % GRID_COLS === 2) {
    lastRowCount = 2;
  }
  // Only split off last 1 or 2 posts if it will not leave a gap in the grid
  if (lastRowCount > 0 && postsAfterFirst.length > GRID_COLS) {
    middlePosts = postsAfterFirst.slice(0, postsAfterFirst.length - lastRowCount);
    lastPosts = postsAfterFirst.slice(postsAfterFirst.length - lastRowCount);
  } else {
    middlePosts = postsAfterFirst;
    lastPosts = [];
  }

  // If only 1 post remains at the end, make a middle post wide (pick the first middle post)
  let wideMiddleIndex = -1;
  if (lastPosts.length === 1 && middlePosts.length > 0) {
    wideMiddleIndex = 0; // or random index for more variety
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">I fokus</h1>

      {/* Blog posts with specific layout */}
      {pagePosts.length > 0 && (
        <div className="space-y-8">
          {/* FIRST post - full width */}
          {firstPost && (
            <div className="w-full">
              <Link href={`/posts/${firstPost.slug || '#'}`} className="block h-full">
                {renderPostCard(firstPost, categories, "wide")}
              </Link>
            </div>
          )}

          {/* Middle posts - standard grid, except possibly one wide */}
          {middlePosts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {middlePosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.slug || '#'}`} className="block h-full col-span-1">
                  {renderPostCard(post, categories, wideMiddleIndex === 0 ? "wide" : "standard")}
                </Link>
              ))}
            </div>
          )}

          {/* LAST posts - 1 or 2 at the end */}
          {lastPosts.length > 0 && (
            <div className={`grid gap-6 ${lastPosts.length === 2 ? "sm:grid-cols-2" : ""}`}>
              {lastPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.slug || "#"}`} className={`block h-full ${lastPosts.length === 1 ? "sm:col-span-2" : ""}`}>
                  {renderPostCard(post, categories, lastPosts.length === 1 ? "wide" : "standard")}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination bar */}
      {totalPages > 1 && (
        <PaginationBar currentPage={page} totalPages={totalPages} />
      )}

      {/* Show a message if no posts */}
      {pagePosts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Inga inlägg hittades.</p>
        </div>
      )}

      {/* DebugPanel for blog index */}
      <DebugPanel debugData={debugData} additionalData={{ posts: pagePosts, categories, total, page }} />
    </div>
  );
}

// PaginationBar: badges with arrows and page numbers
function PaginationBar({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const createPageLink = (page: number) => page === 1 ? "/blog" : `/blog?page=${page}`;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Blog Pagination">
      <Link
        href={createPageLink(currentPage - 1)}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : 0}
        className={cn(
          badgeVariants({ variant: "secondary" }),
          "inline-block",
          "px-6",
          "py-2",
          "text-sm",
          currentPage === 1 ? "opacity-50 pointer-events-none" : ""
        )}
      >
        ←
      </Link>
      {pageNumbers.map((num) => (
        <Link
          key={num}
          href={createPageLink(num)}
          aria-current={num === currentPage ? "page" : undefined}
          className={cn(
            badgeVariants({ variant: num === currentPage ? "default" : "secondary" }),
            "inline-block",
            "px-6",
            "py-2",
            "text-sm"
          )}
        >
          {num}
        </Link>
      ))}
      <Link
        href={createPageLink(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : 0}
        className={cn(
          badgeVariants({ variant: "secondary" }),
          "inline-block",
          "px-6",
          "py-2",
          "text-sm",
          currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
        )}
      >
        →
      </Link>
    </nav>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  // Await searchParams before using
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  return (
    <Suspense fallback={null}>
      <BlogContent page={page} />
    </Suspense>
  );
}

export async function generateMetadata() {
  return {
    title: 'Blog',
    description: 'Latest blog posts and articles',
  };
}