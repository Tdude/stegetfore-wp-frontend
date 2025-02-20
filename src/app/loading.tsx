// src/app/loading.tsx
import { PostSkeletonGrid } from '@/components/PostSkeleton';

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /> {/* Site title */}
        <div className="h-4 bg-gray-200 rounded w-2/3" /> {/* Description */}
      </div>
      <PostSkeletonGrid />
    </main>
  );
}
