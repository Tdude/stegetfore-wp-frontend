import { notFound } from 'next/navigation';
import EvaluationTemplate from '@/components/templates/EvaluationTemplate';

export const dynamic = 'force-dynamic';

async function fetchAssessmentBySlug(slug: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;

  const url = `${apiBase}/wp/v2/ham_assessment?slug=${encodeURIComponent(slug)}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const items = await response.json();
  if (!Array.isArray(items) || items.length === 0) return null;

  return items[0];
}

export default async function AssessmentPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const assessment = await fetchAssessmentBySlug(slug);
  if (!assessment) {
    notFound();
  }

  return <EvaluationTemplate page={assessment} />;
}
