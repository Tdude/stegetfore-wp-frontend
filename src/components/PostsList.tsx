// src/components/PostsList.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { Post } from '@/lib/types';

interface CategoryDisplay {
  id: number;
  name: string;
  slug: string;
}

interface PostsListProps {
  posts: Post[];
  categories?: Record<string, CategoryDisplay>;
}

export default function PostsList({ posts, categories }: PostsListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.slug}`} className="text-sm text-primary">
          <Card className="h-full overflow-hidden">
            {post.featured_image_url && (
              <div className="aspect-video relative overflow-hidden">
                <OptimizedImage
                  src={post.featured_image_url}
                  htmlTitle={post.title.rendered}
                  fill={true}
                  containerType="thumbnail"
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              {/* Categories will be displayed if available */}
              {post.categories && categories && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.categories.slice(0, 2).map((categoryId) => {
                    // Convert categoryId to string since that's what Record<string, CategoryDisplay> expects
                    const categoryKey = categoryId.toString();
                    const category = categories[categoryKey];
                    return category ? (
                      <Badge key={categoryId} variant="secondary">
                        {category.name}
                      </Badge>
                    ) : null;
                  })}
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
              <div className="text-md text-primary hover:underline">
                Läs mer →
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}