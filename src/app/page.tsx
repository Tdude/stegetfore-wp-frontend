// src/app/page.tsx
import { redirect } from 'next/navigation';

// Temporarily redirect home page to landing page
// To restore original homepage, see git history or page.tsx.backup
export default async function HomePage() {
  redirect('/landing');
}