import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <section className="container mx-auto px-4 py-8 flex-grow">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  );
}