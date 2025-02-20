// src/components/PostSkeleton.tsx
export function PostSkeleton() {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
        <div className="h-48 bg-gray-200" /> {/* Image placeholder */}
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" /> {/* Title placeholder */}
          <div className="space-y-2"> {/* Content placeholder */}
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  export function PostSkeletonGrid() {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <PostSkeleton key={key} />
        ))}
      </div>
    );
  }

  export function SinglePostSkeleton() {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-64 md:h-96 bg-gray-200 rounded-lg mb-8" /> {/* Featured image */}
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6" /> {/* Title */}
        <div className="space-y-4"> {/* Content */}
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }