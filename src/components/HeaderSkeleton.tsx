// src/components/HeaderSkeleton.tsx
export default function HeaderSkeleton() {
    return (
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="h-7 w-40 bg-gray-600 rounded animate-pulse" />
            <div className="flex space-x-4">
              {[1, 2, 3].map((key) => (
                <div key={key} className="h-6 w-20 bg-gray-600 rounded animate-pulse" />
              ))}
            </div>
          </nav>
        </div>
      </header>
    );
  }
