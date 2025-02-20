// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} Steget Före. Rättigheter förbehålls.
        </div>
      </div>
    </footer>
  );
}