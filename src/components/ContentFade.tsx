"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ContentFade() {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    setOpacity(0);
    const fadeIn = setTimeout(() => setOpacity(1), 200);
    return () => clearTimeout(fadeIn);
  }, [pathname]);

  useEffect(() => {
    // Always start at 1 on first mount
    setOpacity(1);
  }, []);

  useEffect(() => {
    const el = document.getElementById("main-fade-container");
    if (el) el.style.opacity = String(opacity);
  }, [opacity]);

  return null;
}
