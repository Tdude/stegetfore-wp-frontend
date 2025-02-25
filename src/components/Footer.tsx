// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-black mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-300 text-xs">
          © {new Date().getFullYear()} Steget Före. Rättigheter förbehålls.
        </div>
      </div>
    </footer>
  );
}