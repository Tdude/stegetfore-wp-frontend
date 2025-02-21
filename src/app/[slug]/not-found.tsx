// src/app/[slug]/not-found.tsx
export default function NotFound() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Kunde inte hitta</h1>
        <p className="text-gray-600">Sidan du försöker nå verkar inte finnas.</p>
      </div>
    );
  }