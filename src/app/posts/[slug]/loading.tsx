// src/app/posts/[slug]/loading.tsx
import { SinglePostSkeleton } from '@/components/PostSkeleton';

export default function PostLoading() {
  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <SinglePostSkeleton />
    </main>
  );
}