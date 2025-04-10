// src/app/blog/page.tsx
// blog list page
import { Suspense } from 'react';
import { fetchPosts, fetchCategories } from '@/lib/api';
import { Post } from '@/lib/types/contentTypes';
import { PostSkeleton } from '@/components/PostSkeleton';
import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebugPanel from '@/components/debug/DebugPanel'; // Import DebugPanel from correct path

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

// Main content component that handles data fetching
async function BlogContent() {
  const { posts, categories } = await fetchPostsWithCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">I fokus</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="h-full overflow-hidden">
            {post.featured_image_url && (
              <div className="aspect-video relative overflow-hidden">
                <OptimizedImage
                  src={post.featured_image_url}
                  htmlTitle={post.title.rendered}
                  fill={true}
                  containerType="card"
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              {post.categories && categories && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.categories.slice(0, 2).map((categoryId) => (
                    categories[categoryId as number] && (
                      <Badge key={categoryId} variant="secondary">
                        {categories[categoryId as number].name}
                      </Badge>
                    )
                  ))}
                </div>
              )}
              <CardTitle className="text-xl line-clamp-2">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-muted-foreground line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </CardContent>
            <CardFooter>
              <Link
                href={`/posts/${post.slug}`}
                className="text-sm text-primary hover:underline"
              >
                Read more →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Debug panel at the bottom */}
      <div className="mt-12">
        <DebugPanel 
          title="Page Debug" 
          additionalData={{
            "Posts Count": posts?.length || 0,
            "Categories": categories ? Object.keys(categories).length : 0,
            "Page Type": "Blog Index"
          }}
        />
      </div>
    </div>
  );
}

// Main page component
export default function BlogPage() {
  return (
    <main>
      <Suspense fallback={<PostSkeleton count={6} />}>
        <BlogContent />
      </Suspense>
    </main>
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  return {
    title: 'Blog | Steget Före',
    description: 'Read our latest articles and insights',
  };
}