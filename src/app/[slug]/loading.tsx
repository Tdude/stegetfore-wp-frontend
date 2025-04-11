import { SinglePostSkeleton } from '@/components/PostSkeleton';

export default function Loading() {
  return (
    <section className="container mx-auto px-4 py-8 flex-grow">
      <SinglePostSkeleton />
    </section>
  );
}