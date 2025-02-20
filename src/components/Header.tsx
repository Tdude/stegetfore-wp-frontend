// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Your Site Name
          </Link>
          <div className="space-x-4">
            <Link href="/" className="hover:text-blue-600">
              Start
            </Link>
            <Link href="/about" className="hover:text-blue-600">
              Om oss
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Kontakt
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
