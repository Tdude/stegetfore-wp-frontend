// src/components/PostsList.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import NextImage from '@/components/NextImage';
import { Post } from '@/lib/types/contentTypes';

interface CategoryDisplay {
  id: number;
  name: string;
  slug: string;
}

interface CategoriesMap {
  [key: number]: CategoryDisplay;
}

interface PostsListProps {
  posts: Post[];
  categories?: CategoriesMap;
  title?: string;
}

export default function PostsList({ posts, categories }: PostsListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link href={`/posts/${post.slug}`} className="text-sm text-primary">
          <Card key={post.id} className="h-full overflow-hidden">
            {post.featured_image_url && (
              <div className="aspect-video relative overflow-hidden">
                <NextImage
                  src={post.featured_image_url}
                  htmlTitle={post.title.rendered}
                  fill={true}
                  containerType="card"
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              {/* Categories will be displayed if available */}
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