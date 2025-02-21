import { SinglePostSkeleton } from '@/components/PostSkeleton';

export default function PageLoading() {
  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <SinglePostSkeleton />
    </main>
  );
}