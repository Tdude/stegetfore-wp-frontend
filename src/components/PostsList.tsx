// src/components/PostsList.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Post } from '@/lib/types';

interface CategoryDisplay {
  id: number;
  name: string;
  slug: string;
}

interface PostsListProps {
  posts: Post[];
  categories?: Record<number, CategoryDisplay>;
}

export default function PostsList({ posts, categories }: PostsListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="h-full overflow-hidden">
          {post.featured_image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title.rendered}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            {/* Categories will be displayed if available */}
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
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-muted-foreground line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          </CardContent>
          <CardFooter>
            <Link
              href={`/posts/${post.slug}`}
              className="text-sm text-primary hover:underline"
            >
              Läs mer →
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}