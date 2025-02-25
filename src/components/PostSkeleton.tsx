// src/components/PostSkeleton.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Multiple post skeleton for listings
export function PostSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-full overflow-hidden">
          <div className="aspect-video">
            <Skeleton className="h-full w-full" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-4/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Single post skeleton for post page
export function SinglePostSkeleton() {
  return (
    <article className="max-w-3xl mx-auto">
      <Skeleton className="w-full h-64 md:h-96 rounded-lg mb-8" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="mt-8">
        <Skeleton className="h-8 w-32" />
      </div>
    </article>
  );
}