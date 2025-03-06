// src/components/homepage/FeaturedPosts.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { Post } from '@/lib/types';

interface FeaturedPostProps {
  posts: Post[];
  title: string;
  categories?: Record<number, { id: number; name: string; slug: string }>;
}

export default function FeaturedPosts({ posts, title, categories }: FeaturedPostProps) {
  // Client-side only rendering for HTML content
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Skeleton loader for server-side and initial client render
    return (
      <section className="py-12 bg-muted/50 mx-auto">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter mb-8">{title}</h2>
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
    <section className="py-12 bg-muted/50 mx-auto">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">{title}</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block h-full">
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
                  {post.categories && categories && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.categories.slice(0, 2).map((categoryId) => (
                        categories[categoryId] && (
                          <Badge key={categoryId} variant="secondary">
                            {categories[categoryId].name}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                  <CardTitle className="text-xl line-clamp-2">
                    {post.title?.rendered ? (
                      <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    ) : (
                      post.title?.toString() || 'Post utan namn'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt?.rendered ? (
                    <div
                      className="text-muted-foreground line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                  ) : (
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt?.rendered || ''}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-md text-primary hover:underline">
                    Läs mer →
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}