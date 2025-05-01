// src/app/loading.tsx
export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[200px]">
      <span className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" />
    </main>
  );
}