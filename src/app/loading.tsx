// src/app/loading.tsx

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /> {/* Title */}
        <div className="h-4 bg-gray-200 rounded w-2/3" /> {/* Description */}
      </div>
    </main>
  );
}